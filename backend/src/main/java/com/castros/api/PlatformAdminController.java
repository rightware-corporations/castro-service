package com.castros.api;

import com.castros.platform.PlatformPrincipal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformAdminController {
    private final JdbcTemplate jdbc;

    public PlatformAdminController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/overview")
    public PlatformOverview overview(Authentication authentication) {
        PlatformPrincipal principal = principal(authentication);
        Long organizations = jdbc.queryForObject("select count(*) from organizations", Long.class);
        Long activeOrganizations = jdbc.queryForObject("select count(*) from organizations where active=true", Long.class);
        Long tenantUsers = jdbc.queryForObject("select count(*) from users", Long.class);
        Long activeTenantUsers = jdbc.queryForObject("select count(*) from users where active=true", Long.class);
        Long platformAdministrators = jdbc.queryForObject("select count(*) from platform_administrators where active=true", Long.class);
        Integer databaseProbe = jdbc.queryForObject("select 1", Integer.class);
        return new PlatformOverview(
            value(organizations), value(activeOrganizations), value(tenantUsers), value(activeTenantUsers),
            value(platformAdministrators), databaseProbe != null && databaseProbe == 1 ? "UP" : "UNKNOWN",
            principal.email(), OffsetDateTime.now());
    }

    @GetMapping("/organizations")
    public List<PlatformOrganizationItem> organizations(Authentication authentication) {
        principal(authentication);
        return jdbc.query("""
            select o.id, o.name, o.slug, o.active, o.created_at,
                   count(u.id) as tenant_users,
                   count(u.id) filter (where u.active=true) as active_tenant_users
            from organizations o
            left join users u on u.organization_id=o.id
            group by o.id,o.name,o.slug,o.active,o.created_at
            order by o.created_at asc
            """, (rs, rowNum) -> new PlatformOrganizationItem(
                rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("slug"), rs.getBoolean("active"),
                rs.getLong("tenant_users"), rs.getLong("active_tenant_users"), rs.getObject("created_at", OffsetDateTime.class)));
    }

    @GetMapping("/audit")
    public List<PlatformAuditItem> audit(Authentication authentication) {
        principal(authentication);
        return jdbc.query("""
            select pae.id, pae.action, pae.entity_type, pae.entity_id, pae.details, pae.created_at,
                   pa.email as actor_email
            from platform_audit_events pae
            left join platform_administrators pa on pa.id=pae.actor_platform_admin_id
            order by pae.created_at desc
            limit 100
            """, (rs, rowNum) -> new PlatformAuditItem(
                rs.getObject("id", UUID.class), rs.getString("action"), rs.getString("entity_type"),
                rs.getObject("entity_id", UUID.class), rs.getString("details"), rs.getString("actor_email"),
                rs.getObject("created_at", OffsetDateTime.class)));
    }

    private PlatformPrincipal principal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof PlatformPrincipal principal)) {
            throw new IllegalStateException("Platform endpoint reached without a platform principal");
        }
        return principal;
    }

    private long value(Long value) { return value == null ? 0L : value; }

    public record PlatformOverview(long organizations,
                                   long activeOrganizations,
                                   long tenantUsers,
                                   long activeTenantUsers,
                                   long platformAdministrators,
                                   String databaseStatus,
                                   String administratorEmail,
                                   OffsetDateTime generatedAt) { }

    public record PlatformOrganizationItem(UUID id,
                                           String name,
                                           String slug,
                                           boolean active,
                                           long tenantUsers,
                                           long activeTenantUsers,
                                           OffsetDateTime createdAt) { }

    public record PlatformAuditItem(UUID id,
                                    String action,
                                    String entityType,
                                    UUID entityId,
                                    String details,
                                    String actorEmail,
                                    OffsetDateTime createdAt) { }
}
