package com.castros.api;

import com.castros.user.UserAccount;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/crm")
public class OperationsCrmController {
    private final JdbcTemplate jdbc;

    public OperationsCrmController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/assignees")
    @PreAuthorize("hasAuthority('request.assign')")
    public List<CrmAssignee> assignees(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        return jdbc.query("""
            select distinct u.id, u.first_name, u.last_name, om.experience_type
            from users u
            join organization_members om
              on om.user_id=u.id and om.organization_id=u.organization_id
            where u.organization_id=? and u.active=true
            order by u.first_name,u.last_name
            """, (rs,row) -> new CrmAssignee(
                rs.getObject("id", UUID.class),
                rs.getString("first_name"),
                rs.getString("last_name"),
                rs.getString("experience_type")), organizationId);
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context unavailable");
        }
        return user.organizationId;
    }

    public record CrmAssignee(UUID id, String firstName, String lastName, String experienceType) {}
}
