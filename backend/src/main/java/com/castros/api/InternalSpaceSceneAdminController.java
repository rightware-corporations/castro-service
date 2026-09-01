package com.castros.api;

import com.castros.audit.AuditEventService;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/operations/spaces/{spaceId}/scenes")
public class InternalSpaceSceneAdminController {
    private final JdbcTemplate jdbc;
    private final AuditEventService audit;

    public InternalSpaceSceneAdminController(JdbcTemplate jdbc, AuditEventService audit) { this.jdbc = jdbc; this.audit = audit; }

    @GetMapping
    @PreAuthorize("hasAuthority('space.read')")
    public List<SceneItem> list(@PathVariable UUID spaceId, Authentication authentication) {
        requireSpace(organizationId(authentication), spaceId);
        return jdbc.query("""
            select id, space_id, panorama_url, title, initial_yaw, initial_pitch, sort_order
            from space_scenes where space_id=? order by sort_order, title nulls last, id
            """, (rs, row) -> map(rs), spaceId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public SceneItem create(@PathVariable UUID spaceId, @Valid @RequestBody SceneInput input, Authentication authentication) {
        requireSpace(organizationId(authentication), spaceId);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into space_scenes(id,space_id,panorama_url,title,initial_yaw,initial_pitch,sort_order) values (?,?,?,?,?,?,?)",
            id, spaceId, input.panoramaUrl().trim(), clean(input.title()), input.initialYaw(), input.initialPitch(), input.sortOrder());
        audit.record(authentication, "CREATE", "SPACE_SCENE", id, "spaceId=" + spaceId);
        return get(spaceId, id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public SceneItem update(@PathVariable UUID spaceId, @PathVariable UUID id, @Valid @RequestBody SceneInput input, Authentication authentication) {
        requireSpace(organizationId(authentication), spaceId);
        if (jdbc.update("update space_scenes set panorama_url=?,title=?,initial_yaw=?,initial_pitch=?,sort_order=? where id=? and space_id=?",
            input.panoramaUrl().trim(), clean(input.title()), input.initialYaw(), input.initialPitch(), input.sortOrder(), id, spaceId) == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Scene not found");
        }
        audit.record(authentication, "UPDATE", "SPACE_SCENE", id, "spaceId=" + spaceId);
        return get(spaceId, id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public void delete(@PathVariable UUID spaceId, @PathVariable UUID id, Authentication authentication) {
        requireSpace(organizationId(authentication), spaceId);
        Long refs = jdbc.queryForObject("select count(*) from space_hotspots where scene_id=? or target_scene_id=?", Long.class, id, id);
        if (refs != null && refs > 0) throw new ResponseStatusException(CONFLICT, "Scene is referenced by hotspots");
        if (jdbc.update("delete from space_scenes where id=? and space_id=?", id, spaceId) == 0) throw new ResponseStatusException(NOT_FOUND, "Scene not found");
        audit.record(authentication, "DELETE", "SPACE_SCENE", id, "spaceId=" + spaceId);
    }

    private SceneItem get(UUID spaceId, UUID id) {
        List<SceneItem> rows = jdbc.query("select id,space_id,panorama_url,title,initial_yaw,initial_pitch,sort_order from space_scenes where id=? and space_id=?",
            (rs, row) -> map(rs), id, spaceId);
        if (rows.isEmpty()) throw new ResponseStatusException(NOT_FOUND, "Scene not found");
        return rows.getFirst();
    }

    private SceneItem map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new SceneItem(rs.getObject("id", UUID.class), rs.getObject("space_id", UUID.class), rs.getString("panorama_url"), rs.getString("title"), rs.getDouble("initial_yaw"), rs.getDouble("initial_pitch"), rs.getInt("sort_order"));
    }

    private void requireSpace(UUID organizationId, UUID spaceId) {
        Long count = jdbc.queryForObject("select count(*) from spaces where id=? and organization_id=?", Long.class, spaceId, organizationId);
        if (count == null || count == 0) throw new ResponseStatusException(NOT_FOUND, "Space not found");
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        return user.organizationId;
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    public record SceneItem(UUID id, UUID spaceId, String panoramaUrl, String title, double initialYaw, double initialPitch, int sortOrder) {}
    public record SceneInput(@NotBlank @Size(max=4000) String panoramaUrl, @Size(max=200) String title, double initialYaw, double initialPitch, int sortOrder) {}
}
