package com.castros.api;

import com.castros.user.UserAccount;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/v1/operations/audit")
public class InternalAuditController {
    private final JdbcTemplate jdbc;

    public InternalAuditController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    @PreAuthorize("hasAuthority('audit.read')")
    public List<AuditItem> list(Authentication authentication) {
        UUID org = organizationId(authentication);
        return jdbc.query("""
            select a.id,a.actor_user_id,u.first_name,u.last_name,u.email,a.action,a.entity_type,a.entity_id,a.details,a.created_at
            from audit_events a
            left join users u on u.id=a.actor_user_id and u.organization_id=a.organization_id
            where a.organization_id=?
            order by a.created_at desc
            limit 200
            """, (rs,row) -> new AuditItem(
            rs.getObject("id",UUID.class), rs.getObject("actor_user_id",UUID.class),
            rs.getString("first_name"), rs.getString("last_name"), rs.getString("email"),
            rs.getString("action"), rs.getString("entity_type"), rs.getObject("entity_id",UUID.class),
            rs.getString("details"), rs.getObject("created_at",OffsetDateTime.class)), org);
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        return user.organizationId;
    }

    public record AuditItem(UUID id, UUID actorUserId, String actorFirstName, String actorLastName, String actorEmail, String action, String entityType, UUID entityId, String details, OffsetDateTime createdAt) {}
}
