package com.castros.api;

import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/tasks")
public class InternalTaskController {
    private final JdbcTemplate jdbc;

    public InternalTaskController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping @PreAuthorize("hasAuthority('task.read')")
    public List<TaskItem> list(Authentication authentication) {
        UUID org = organizationId(authentication);
        return jdbc.query("""
            select t.id,t.title,t.description,t.status,t.priority,t.due_at,t.assigned_user_id,
                   t.request_id,t.booking_id,t.customer_id,t.created_at,t.updated_at,
                   u.first_name as assignee_first,u.last_name as assignee_last
            from tasks t left join users u on u.id=t.assigned_user_id and u.organization_id=t.organization_id
            where t.organization_id=?
            order by case t.status when 'OPEN' then 0 when 'IN_PROGRESS' then 1 else 2 end,
                     t.due_at nulls last,t.created_at desc
            """, (rs,row) -> new TaskItem(
                rs.getObject("id", UUID.class), rs.getString("title"), rs.getString("description"),
                rs.getString("status"), rs.getString("priority"), rs.getObject("due_at", OffsetDateTime.class),
                rs.getObject("assigned_user_id", UUID.class), assignee(rs.getString("assignee_first"), rs.getString("assignee_last")),
                rs.getObject("request_id", UUID.class), rs.getObject("booking_id", UUID.class), rs.getObject("customer_id", UUID.class),
                rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class)
            ), org);
    }

    @PostMapping @PreAuthorize("hasAuthority('task.manage')") @Transactional
    public TaskItem create(@Valid @RequestBody TaskInput input, Authentication authentication) {
        UUID org = organizationId(authentication); UUID actor = actorId(authentication); UUID id = UUID.randomUUID();
        validateReferences(org,input);
        jdbc.update("""
            insert into tasks(id,organization_id,title,description,status,priority,due_at,assigned_user_id,request_id,booking_id,customer_id,created_by)
            values (?,?,?,?,?,?,?,?,?,?,?,?)
            """, id,org,input.title().trim(),blankToNull(input.description()),input.status().name(),input.priority().name(),input.dueAt(),input.assignedUserId(),input.requestId(),input.bookingId(),input.customerId(),actor);
        notifyAssignment(org, actor, input.assignedUserId(), id, input.title().trim());
        return one(org,id);
    }

    @PutMapping("/{id}") @PreAuthorize("hasAuthority('task.manage')") @Transactional
    public TaskItem update(@PathVariable UUID id,@Valid @RequestBody TaskInput input,Authentication authentication) {
        UUID org=organizationId(authentication); UUID actor=actorId(authentication); ensureExists(org,id); validateReferences(org,input);
        UUID previousAssignee = jdbc.queryForObject("select assigned_user_id from tasks where id=? and organization_id=?", UUID.class, id, org);
        jdbc.update("""
            update tasks set title=?,description=?,status=?,priority=?,due_at=?,assigned_user_id=?,request_id=?,booking_id=?,customer_id=?,updated_at=now()
            where id=? and organization_id=?
            """,input.title().trim(),blankToNull(input.description()),input.status().name(),input.priority().name(),input.dueAt(),input.assignedUserId(),input.requestId(),input.bookingId(),input.customerId(),id,org);
        if (!java.util.Objects.equals(previousAssignee, input.assignedUserId())) notifyAssignment(org, actor, input.assignedUserId(), id, input.title().trim());
        return one(org,id);
    }

    @PatchMapping("/{id}/status") @PreAuthorize("hasAuthority('task.manage')") @Transactional
    public TaskItem updateStatus(@PathVariable UUID id,@Valid @RequestBody TaskStatusInput input,Authentication authentication) {
        UUID org=organizationId(authentication); ensureExists(org,id);
        jdbc.update("update tasks set status=?,updated_at=now() where id=? and organization_id=?",input.status().name(),id,org);
        return one(org,id);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasAuthority('task.manage')") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void delete(@PathVariable UUID id,Authentication authentication) {
        UUID org=organizationId(authentication); int changed=jdbc.update("delete from tasks where id=? and organization_id=?",id,org);
        if(changed==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found");
    }

    private TaskItem one(UUID org,UUID id){
        return jdbc.query("""
            select t.id,t.title,t.description,t.status,t.priority,t.due_at,t.assigned_user_id,t.request_id,t.booking_id,t.customer_id,t.created_at,t.updated_at,
                   u.first_name assignee_first,u.last_name assignee_last
            from tasks t left join users u on u.id=t.assigned_user_id and u.organization_id=t.organization_id
            where t.organization_id=? and t.id=?
            """,rs->{ if(!rs.next()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found"); return new TaskItem(
                rs.getObject("id",UUID.class),rs.getString("title"),rs.getString("description"),rs.getString("status"),rs.getString("priority"),rs.getObject("due_at",OffsetDateTime.class),
                rs.getObject("assigned_user_id",UUID.class),assignee(rs.getString("assignee_first"),rs.getString("assignee_last")),rs.getObject("request_id",UUID.class),rs.getObject("booking_id",UUID.class),rs.getObject("customer_id",UUID.class),
                rs.getObject("created_at",OffsetDateTime.class),rs.getObject("updated_at",OffsetDateTime.class)); },org,id);
    }
    private void validateReferences(UUID org,TaskInput input){
        ensureOrgRef(org,"users",input.assignedUserId()); ensureOrgRef(org,"requests",input.requestId()); ensureOrgRef(org,"bookings",input.bookingId()); ensureOrgRef(org,"customers",input.customerId());
    }
    private void notifyAssignment(UUID org, UUID actor, UUID recipient, UUID taskId, String taskTitle) {
        if (recipient == null || recipient.equals(actor)) return;
        jdbc.update("""
            insert into notifications(id,organization_id,recipient_user_id,type,title,body,resource_type,resource_id)
            values (?,?,?,?,?,?,?,?)
            """, UUID.randomUUID(), org, recipient, "TASK_ASSIGNED", "Nova tarefa atribuída", taskTitle, "TASK", taskId);
    }
    private void ensureOrgRef(UUID org,String table,UUID id){ if(id==null)return; Integer count=jdbc.queryForObject("select count(*) from "+table+" where id=? and organization_id=?",Integer.class,id,org); if(count==null||count==0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Related resource does not belong to organization"); }
    private void ensureExists(UUID org,UUID id){ Integer count=jdbc.queryForObject("select count(*) from tasks where id=? and organization_id=?",Integer.class,id,org); if(count==null||count==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found"); }
    private UUID organizationId(Authentication authentication){ if(authentication==null||!(authentication.getPrincipal() instanceof UserAccount user)||user.organizationId==null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Organization context required"); return user.organizationId; }
    private UUID actorId(Authentication authentication){ return authentication!=null&&authentication.getPrincipal() instanceof UserAccount user?user.id:null; }
    private String blankToNull(String value){ return value==null||value.isBlank()?null:value.trim(); }
    private String assignee(String first,String last){ String value=((first==null?"":first)+" "+(last==null?"":last)).trim(); return value.isEmpty()?null:value; }

    public record TaskItem(UUID id,String title,String description,String status,String priority,OffsetDateTime dueAt,UUID assignedUserId,String assignedUserName,UUID requestId,UUID bookingId,UUID customerId,OffsetDateTime createdAt,OffsetDateTime updatedAt){}
    public record TaskInput(@NotBlank @Size(max=180) String title,@Size(max=4000) String description,@NotNull TaskStatus status,@NotNull TaskPriority priority,OffsetDateTime dueAt,UUID assignedUserId,UUID requestId,UUID bookingId,UUID customerId){}
    public record TaskStatusInput(@NotNull TaskStatus status){}
    public enum TaskStatus { OPEN, IN_PROGRESS, DONE, CANCELLED }
    public enum TaskPriority { LOW, NORMAL, HIGH, URGENT }
}
