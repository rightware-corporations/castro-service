package com.castros.api;

import com.castros.user.UserAccount;
import com.castros.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/operations/access")
public class InternalAccessAdminController {
    private final JdbcTemplate jdbc;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public InternalAccessAdminController(JdbcTemplate jdbc, UserRepository users, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc; this.users = users; this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users") @PreAuthorize("hasAuthority('user.read')")
    public List<UserItem> listUsers(Authentication authentication) {
        UUID org = organizationId(authentication);
        return jdbc.query("""
            select u.id,u.email,u.first_name,u.last_name,u.active,u.created_at,r.id as role_id,r.name as role_name
            from users u left join organization_members om on om.user_id=u.id and om.organization_id=u.organization_id
            left join roles r on r.id=om.role_id and r.organization_id=u.organization_id
            where u.organization_id=? order by u.first_name,u.last_name,u.email
            """, (rs,row) -> new UserItem(rs.getObject("id",UUID.class),rs.getString("email"),rs.getString("first_name"),rs.getString("last_name"),rs.getBoolean("active"),rs.getObject("created_at",OffsetDateTime.class),rs.getObject("role_id",UUID.class),rs.getString("role_name")), org);
    }

    @PostMapping("/users") @PreAuthorize("hasAuthority('user.manage')") @Transactional
    public UserItem createUser(@Valid @RequestBody CreateUserInput input, Authentication authentication) {
        UUID org = organizationId(authentication); UUID roleId = validateRole(org,input.roleId());
        UserAccount user = new UserAccount(org,input.email().trim().toLowerCase(Locale.ROOT),passwordEncoder.encode(input.password()),input.firstName().trim(),input.lastName().trim());
        user.active=input.active();
        try { user=users.saveAndFlush(user); } catch (DataIntegrityViolationException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already exists"); }
        if (roleId!=null) jdbc.update("insert into organization_members (id,organization_id,user_id,role_id) values (?,?,?,?)",UUID.randomUUID(),org,user.id,roleId);
        return userItem(org,user.id);
    }

    @PutMapping("/users/{id}") @PreAuthorize("hasAuthority('user.manage')") @Transactional
    public UserItem updateUser(@PathVariable UUID id,@Valid @RequestBody UpdateUserInput input,Authentication authentication) {
        UserAccount actor = currentUser(authentication);
        UUID org=actor.organizationId;
        if (actor.id != null && actor.id.equals(id)) {
            if (!input.active()) throw new ResponseStatusException(HttpStatus.CONFLICT,"The current user cannot deactivate their own account");
            if (input.roleId()==null) throw new ResponseStatusException(HttpStatus.CONFLICT,"The current user cannot remove their own role");
        }
        UserAccount user=users.findById(id).filter(value->org.equals(value.organizationId)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));
        user.email=input.email().trim().toLowerCase(Locale.ROOT); user.firstName=input.firstName().trim(); user.lastName=input.lastName().trim(); user.active=input.active();
        if(input.password()!=null&&!input.password().isBlank()) user.passwordHash=passwordEncoder.encode(input.password());
        try { users.saveAndFlush(user); } catch(DataIntegrityViolationException ex){ throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already exists"); }
        assignRole(org,id,input.roleId()); return userItem(org,id);
    }

    @GetMapping("/roles") @PreAuthorize("hasAuthority('role.read')")
    public List<RoleItem> listRoles(Authentication authentication){ UUID org=organizationId(authentication); return jdbc.query("select id,name from roles where organization_id=? order by name",(rs,row)->roleItem(rs.getObject("id",UUID.class),rs.getString("name")),org); }

    @PostMapping("/roles") @PreAuthorize("hasAuthority('role.manage')") @Transactional
    public RoleItem createRole(@Valid @RequestBody RoleInput input,Authentication authentication){ UUID org=organizationId(authentication),id=UUID.randomUUID(); try{jdbc.update("insert into roles (id,organization_id,name) values (?,?,?)",id,org,input.name().trim());}catch(DataIntegrityViolationException ex){throw new ResponseStatusException(HttpStatus.CONFLICT,"Role name already exists");} replaceRolePermissions(org,id,input.permissionCodes()); return roleItem(id,input.name().trim()); }

    @PutMapping("/roles/{id}") @PreAuthorize("hasAuthority('role.manage')") @Transactional
    public RoleItem updateRole(@PathVariable UUID id,@Valid @RequestBody RoleInput input,Authentication authentication){ UUID org=organizationId(authentication); ensureRole(org,id); try{jdbc.update("update roles set name=? where id=? and organization_id=?",input.name().trim(),id,org);}catch(DataIntegrityViolationException ex){throw new ResponseStatusException(HttpStatus.CONFLICT,"Role name already exists");} replaceRolePermissions(org,id,input.permissionCodes()); return roleItem(id,input.name().trim()); }

    @DeleteMapping("/roles/{id}") @PreAuthorize("hasAuthority('role.manage')") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void deleteRole(@PathVariable UUID id,Authentication authentication){ UUID org=organizationId(authentication); ensureRole(org,id); Integer members=jdbc.queryForObject("select count(*) from organization_members where organization_id=? and role_id=?",Integer.class,org,id); if(members!=null&&members>0) throw new ResponseStatusException(HttpStatus.CONFLICT,"Role is assigned to users"); jdbc.update("delete from role_permissions where role_id=?",id); jdbc.update("delete from roles where id=? and organization_id=?",id,org); }

    @GetMapping("/permissions") @PreAuthorize("hasAuthority('permission.read')")
    public List<PermissionItem> listPermissions(){ return jdbc.query("select code from permissions order by code",(rs,row)->new PermissionItem(rs.getString("code"))); }

    private void assignRole(UUID org,UUID userId,UUID roleId){ UUID validated=validateRole(org,roleId); jdbc.update("delete from organization_members where organization_id=? and user_id=?",org,userId); if(validated!=null) jdbc.update("insert into organization_members (id,organization_id,user_id,role_id) values (?,?,?,?)",UUID.randomUUID(),org,userId,validated); }
    private UUID validateRole(UUID org,UUID roleId){ if(roleId==null)return null; ensureRole(org,roleId); return roleId; }
    private void ensureRole(UUID org,UUID roleId){ Integer count=jdbc.queryForObject("select count(*) from roles where id=? and organization_id=?",Integer.class,roleId,org); if(count==null||count==0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Role does not belong to organization"); }
    private void replaceRolePermissions(UUID org,UUID roleId,Set<String> codes){ ensureRole(org,roleId); if(codes==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Permission codes are required"); List<Map<String,Object>> rows=codes.isEmpty()?List.of():jdbc.queryForList("select id,code from permissions where code in ("+String.join(",",Collections.nCopies(codes.size(),"?"))+")",codes.toArray()); if(rows.size()!=codes.size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Unknown permission code"); jdbc.update("delete from role_permissions where role_id=?",roleId); for(Map<String,Object> row:rows) jdbc.update("insert into role_permissions (id,role_id,permission_id) values (?,?,?)",UUID.randomUUID(),roleId,row.get("id")); }
    private UserItem userItem(UUID org,UUID id){
        String sql = "select u.id,u.email,u.first_name,u.last_name,u.active,u.created_at,r.id role_id,r.name role_name " +
            "from users u left join organization_members om on om.user_id=u.id and om.organization_id=u.organization_id " +
            "left join roles r on r.id=om.role_id where u.organization_id=? and u.id=?";
        return jdbc.query(sql,rs->{if(!rs.next())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"); return new UserItem(rs.getObject("id",UUID.class),rs.getString("email"),rs.getString("first_name"),rs.getString("last_name"),rs.getBoolean("active"),rs.getObject("created_at",OffsetDateTime.class),rs.getObject("role_id",UUID.class),rs.getString("role_name"));},org,id);
    }
    private RoleItem roleItem(UUID id,String name){ List<String> permissions=jdbc.query("select p.code from role_permissions rp join permissions p on p.id=rp.permission_id where rp.role_id=? order by p.code",(rs,row)->rs.getString(1),id); return new RoleItem(id,name,permissions); }
    private UserAccount currentUser(Authentication authentication){ if(authentication==null||!(authentication.getPrincipal() instanceof UserAccount user)||user.organizationId==null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Organization context required"); return user; }
    private UUID organizationId(Authentication authentication){ return currentUser(authentication).organizationId; }

    public record UserItem(UUID id,String email,String firstName,String lastName,boolean active,OffsetDateTime createdAt,UUID roleId,String roleName){}
    public record RoleItem(UUID id,String name,List<String> permissionCodes){}
    public record PermissionItem(String code){}
    public record CreateUserInput(@Email @NotBlank String email,@NotBlank @Size(min=8,max=200) String password,@NotBlank String firstName,@NotBlank String lastName,boolean active,UUID roleId){}
    public record UpdateUserInput(@Email @NotBlank String email,@Size(min=8,max=200) String password,@NotBlank String firstName,@NotBlank String lastName,boolean active,UUID roleId){}
    public record RoleInput(@NotBlank @Size(max=80) String name,@NotNull Set<String> permissionCodes){}
}
