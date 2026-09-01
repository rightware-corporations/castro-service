package com.castros.audit;

import com.castros.user.UserAccount;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuditEventService {
    private final JdbcTemplate jdbc;

    public AuditEventService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void record(Authentication authentication, String action, String entityType, UUID entityId, String details) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) return;
        jdbc.update("insert into audit_events(id,organization_id,actor_user_id,action,entity_type,entity_id,details,created_at) values (?,?,?,?,?,?,?,?)",
            UUID.randomUUID(), user.organizationId, user.id, action, entityType, entityId, clean(details), OffsetDateTime.now());
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
