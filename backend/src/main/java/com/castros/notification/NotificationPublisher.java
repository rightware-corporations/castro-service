package com.castros.notification;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationPublisher {
    private final JdbcTemplate jdbc;

    public NotificationPublisher(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void publishToOperations(UUID organizationId, String type, String title, String body,
                                    String resourceType, UUID resourceId) {
        List<UUID> recipients = jdbc.queryForList("""
            select distinct om.user_id
            from organization_members om
            join users u on u.id = om.user_id
            join role_permissions rp on rp.role_id = om.role_id
            join permissions p on p.id = rp.permission_id
            where om.organization_id = ?
              and u.active = true
              and p.code = 'notification.read'
            """, UUID.class, organizationId);

        for (UUID recipient : recipients) {
            jdbc.update("""
                insert into notifications(id, organization_id, recipient_user_id, type, title, body, resource_type, resource_id, created_at)
                values (?, ?, ?, ?, ?, ?, ?, ?, now())
                """, UUID.randomUUID(), organizationId, recipient, type, title, body, resourceType, resourceId);
        }
    }
}
