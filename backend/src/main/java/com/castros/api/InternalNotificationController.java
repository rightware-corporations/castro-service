package com.castros.api;

import com.castros.user.UserAccount;
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
@RequestMapping("/api/v1/operations/notifications")
public class InternalNotificationController {
    private final JdbcTemplate jdbc;

    public InternalNotificationController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    @PreAuthorize("hasAuthority('notification.read')")
    public List<NotificationItem> list(Authentication authentication) {
        UserContext context = context(authentication);
        return jdbc.query("""
            select id,type,title,body,resource_type,resource_id,read_at,created_at
            from notifications
            where organization_id=? and recipient_user_id=?
            order by created_at desc
            limit 200
            """, (rs,row) -> new NotificationItem(
                rs.getObject("id", UUID.class),
                rs.getString("type"),
                rs.getString("title"),
                rs.getString("body"),
                rs.getString("resource_type"),
                rs.getObject("resource_id", UUID.class),
                rs.getObject("read_at", OffsetDateTime.class),
                rs.getObject("created_at", OffsetDateTime.class)
            ), context.organizationId(), context.userId());
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAuthority('notification.read')")
    @Transactional
    public NotificationItem markRead(@PathVariable UUID id, Authentication authentication) {
        UserContext context = context(authentication);
        int changed = jdbc.update("""
            update notifications set read_at=coalesce(read_at,now())
            where id=? and organization_id=? and recipient_user_id=?
            """, id, context.organizationId(), context.userId());
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
        return one(context, id);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAuthority('notification.read')")
    @Transactional
    public void markAllRead(Authentication authentication) {
        UserContext context = context(authentication);
        jdbc.update("""
            update notifications set read_at=now()
            where organization_id=? and recipient_user_id=? and read_at is null
            """, context.organizationId(), context.userId());
    }

    private NotificationItem one(UserContext context, UUID id) {
        return jdbc.query("""
            select id,type,title,body,resource_type,resource_id,read_at,created_at
            from notifications
            where id=? and organization_id=? and recipient_user_id=?
            """, rs -> {
                if (!rs.next()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found");
                return new NotificationItem(
                    rs.getObject("id", UUID.class), rs.getString("type"), rs.getString("title"), rs.getString("body"),
                    rs.getString("resource_type"), rs.getObject("resource_id", UUID.class),
                    rs.getObject("read_at", OffsetDateTime.class), rs.getObject("created_at", OffsetDateTime.class));
            }, id, context.organizationId(), context.userId());
    }

    private UserContext context(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null || user.id == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User context required");
        }
        return new UserContext(user.organizationId, user.id);
    }

    private record UserContext(UUID organizationId, UUID userId) {}
    public record NotificationItem(UUID id,String type,String title,String body,String resourceType,UUID resourceId,OffsetDateTime readAt,OffsetDateTime createdAt) {}
}
