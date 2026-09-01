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

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/operations/spaces/{spaceId}/scenes/{sceneId}/hotspots")
public class InternalSpaceHotspotAdminController {
    private final JdbcTemplate jdbc;
    private final AuditEventService audit;

    public InternalSpaceHotspotAdminController(JdbcTemplate jdbc, AuditEventService audit) { this.jdbc = jdbc; this.audit = audit; }

    @GetMapping
    @PreAuthorize("hasAuthority('space.read')")
    public List<HotspotItem> list(@PathVariable UUID spaceId, @PathVariable UUID sceneId, Authentication authentication) {
        requireScene(organizationId(authentication), spaceId, sceneId);
        return jdbc.query("""
            select id,scene_id,title,description,yaw,pitch,type,target_scene_id,amenity_id
            from space_hotspots where scene_id=? order by title,id
            """, (rs,row) -> map(rs), sceneId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public HotspotItem create(@PathVariable UUID spaceId, @PathVariable UUID sceneId, @Valid @RequestBody HotspotInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireScene(org, spaceId, sceneId); validateLinks(org, spaceId, input);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into space_hotspots(id,scene_id,title,description,yaw,pitch,type,target_scene_id,amenity_id) values (?,?,?,?,?,?,?,?,?)",
            id, sceneId, input.title().trim(), clean(input.description()), input.yaw(), input.pitch(), normalizeType(input.type()), input.targetSceneId(), input.resourceId());
        audit.record(authentication, "CREATE", "SPACE_HOTSPOT", id, "spaceId=" + spaceId + ";sceneId=" + sceneId);
        return get(sceneId,id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public HotspotItem update(@PathVariable UUID spaceId, @PathVariable UUID sceneId, @PathVariable UUID id, @Valid @RequestBody HotspotInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireScene(org, spaceId, sceneId); validateLinks(org, spaceId, input);
        if (jdbc.update("update space_hotspots set title=?,description=?,yaw=?,pitch=?,type=?,target_scene_id=?,amenity_id=? where id=? and scene_id=?",
            input.title().trim(), clean(input.description()), input.yaw(), input.pitch(), normalizeType(input.type()), input.targetSceneId(), input.resourceId(), id, sceneId) == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Hotspot not found");
        }
        audit.record(authentication, "UPDATE", "SPACE_HOTSPOT", id, "spaceId=" + spaceId + ";sceneId=" + sceneId);
        return get(sceneId,id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public void delete(@PathVariable UUID spaceId, @PathVariable UUID sceneId, @PathVariable UUID id, Authentication authentication) {
        requireScene(organizationId(authentication), spaceId, sceneId);
        if (jdbc.update("delete from space_hotspots where id=? and scene_id=?", id, sceneId) == 0) throw new ResponseStatusException(NOT_FOUND, "Hotspot not found");
        audit.record(authentication, "DELETE", "SPACE_HOTSPOT", id, "spaceId=" + spaceId + ";sceneId=" + sceneId);
    }

    private void validateLinks(UUID org, UUID spaceId, HotspotInput input) {
        if (input.targetSceneId() != null) requireScene(org, spaceId, input.targetSceneId());
        if (input.resourceId() != null) {
            Long count = jdbc.queryForObject("select count(*) from space_resources r join spaces s on s.id=r.space_id where r.id=? and r.space_id=? and s.organization_id=?", Long.class, input.resourceId(), spaceId, org);
            if (count == null || count == 0) throw new ResponseStatusException(BAD_REQUEST, "Resource does not belong to this space");
        }
    }

    private void requireScene(UUID org, UUID spaceId, UUID sceneId) {
        Long count = jdbc.queryForObject("select count(*) from space_scenes sc join spaces s on s.id=sc.space_id where sc.id=? and sc.space_id=? and s.organization_id=?", Long.class, sceneId, spaceId, org);
        if (count == null || count == 0) throw new ResponseStatusException(NOT_FOUND, "Scene not found");
    }

    private HotspotItem get(UUID sceneId, UUID id) {
        List<HotspotItem> rows = jdbc.query("select id,scene_id,title,description,yaw,pitch,type,target_scene_id,amenity_id from space_hotspots where id=? and scene_id=?", (rs,row) -> map(rs), id, sceneId);
        if (rows.isEmpty()) throw new ResponseStatusException(NOT_FOUND, "Hotspot not found");
        return rows.getFirst();
    }

    private HotspotItem map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new HotspotItem(rs.getObject("id",UUID.class), rs.getObject("scene_id",UUID.class), rs.getString("title"), rs.getString("description"), rs.getDouble("yaw"), rs.getDouble("pitch"), rs.getString("type"), rs.getObject("target_scene_id",UUID.class), rs.getObject("amenity_id",UUID.class));
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        return user.organizationId;
    }

    private String normalizeType(String value) { return value.trim().toUpperCase(java.util.Locale.ROOT); }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    public record HotspotItem(UUID id, UUID sceneId, String title, String description, double yaw, double pitch, String type, UUID targetSceneId, UUID resourceId) {}
    public record HotspotInput(@NotBlank @Size(max=200) String title, @Size(max=5000) String description, double yaw, double pitch, @NotBlank @Size(max=50) String type, UUID targetSceneId, UUID resourceId) {}
}
