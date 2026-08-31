package com.castros.api;

import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/operations/content")
public class InternalContentAdminController {
    private final JdbcTemplate jdbc;

    public InternalContentAdminController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    @PreAuthorize("hasAuthority('content.read')")
    public List<ContentItem> list(Authentication authentication) {
        UUID org = organizationId(authentication);
        return jdbc.query("""
            select id, content_key, title, body, media_url, status, published_at, created_at, updated_at
            from content_entries where organization_id=? order by content_key
            """, (rs, row) -> map(rs), org);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('content.manage')")
    @Transactional
    public ContentItem create(@Valid @RequestBody ContentInput input, Authentication authentication) {
        UUID org = organizationId(authentication);
        if (exists(org, input.contentKey(), null)) throw new ResponseStatusException(CONFLICT, "Content key already exists");
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime publishedAt = "PUBLISHED".equals(input.status()) ? now : null;
        jdbc.update("""
            insert into content_entries(id,organization_id,content_key,title,body,media_url,status,published_at,created_at,updated_at)
            values (?,?,?,?,?,?,?,?,?,?)
            """, id, org, input.contentKey().trim(), clean(input.title()), clean(input.body()), clean(input.mediaUrl()), input.status(), publishedAt, now, now);
        return get(org, id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('content.manage')")
    @Transactional
    public ContentItem update(@PathVariable UUID id, @Valid @RequestBody ContentInput input, Authentication authentication) {
        UUID org = organizationId(authentication);
        ContentItem current = get(org, id);
        if (exists(org, input.contentKey(), id)) throw new ResponseStatusException(CONFLICT, "Content key already exists");
        OffsetDateTime publishedAt = "PUBLISHED".equals(input.status())
            ? (current.publishedAt() == null ? OffsetDateTime.now() : current.publishedAt())
            : null;
        jdbc.update("""
            update content_entries set content_key=?, title=?, body=?, media_url=?, status=?, published_at=?, updated_at=now()
            where id=? and organization_id=?
            """, input.contentKey().trim(), clean(input.title()), clean(input.body()), clean(input.mediaUrl()), input.status(), publishedAt, id, org);
        return get(org, id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('content.manage')")
    @Transactional
    public void delete(@PathVariable UUID id, Authentication authentication) {
        UUID org = organizationId(authentication);
        int changed = jdbc.update("delete from content_entries where id=? and organization_id=?", id, org);
        if (changed == 0) throw new ResponseStatusException(NOT_FOUND, "Content entry not found");
    }

    private ContentItem get(UUID org, UUID id) {
        return jdbc.query("""
            select id, content_key, title, body, media_url, status, published_at, created_at, updated_at
            from content_entries where organization_id=? and id=?
            """, rs -> rs.next() ? map(rs) : null, org, id);
    }

    private ContentItem map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ContentItem(
            rs.getObject("id", UUID.class), rs.getString("content_key"), rs.getString("title"), rs.getString("body"),
            rs.getString("media_url"), rs.getString("status"), rs.getObject("published_at", OffsetDateTime.class),
            rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class)
        );
    }

    private boolean exists(UUID org, String key, UUID excludingId) {
        Long count = excludingId == null
            ? jdbc.queryForObject("select count(*) from content_entries where organization_id=? and content_key=?", Long.class, org, key.trim())
            : jdbc.queryForObject("select count(*) from content_entries where organization_id=? and content_key=? and id<>?", Long.class, org, key.trim(), excludingId);
        return count != null && count > 0;
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        }
        return user.organizationId;
    }

    public record ContentItem(UUID id, String contentKey, String title, String body, String mediaUrl, String status,
                              OffsetDateTime publishedAt, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    public record ContentInput(
        @NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9][a-z0-9._-]*") String contentKey,
        @Size(max = 240) String title,
        @Size(max = 20000) String body,
        @Size(max = 4000) String mediaUrl,
        @NotBlank @Pattern(regexp = "DRAFT|PUBLISHED") String status
    ) {}
}
