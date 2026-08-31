package com.castros.api;

import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/operations/spaces/{spaceId}")
public class InternalSpaceExperienceAdminController {
    private final JdbcTemplate jdbc;

    public InternalSpaceExperienceAdminController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/layouts")
    @PreAuthorize("hasAuthority('space.read')")
    public List<LayoutItem> layouts(@PathVariable UUID spaceId, Authentication authentication) {
        UUID org = organizationId(authentication);
        requireSpace(org, spaceId);
        return jdbc.query("""
            select id,space_id,name,description,capacity,active,sort_order,created_at,updated_at
            from space_layouts where space_id=? order by sort_order,name
            """, (rs,row) -> new LayoutItem(rs.getObject("id",UUID.class), rs.getObject("space_id",UUID.class), rs.getString("name"), rs.getString("description"),
            (Integer) rs.getObject("capacity"), rs.getBoolean("active"), rs.getInt("sort_order"), rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class)), spaceId);
    }

    @PostMapping("/layouts")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public LayoutItem createLayout(@PathVariable UUID spaceId, @Valid @RequestBody LayoutInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId); ensureUnique("space_layouts", spaceId, input.name(), null);
        UUID id = UUID.randomUUID(); OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into space_layouts(id,space_id,name,description,capacity,active,sort_order,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)",
            id, spaceId, input.name().trim(), clean(input.description()), input.capacity(), input.active(), input.sortOrder(), now, now);
        return layout(spaceId,id);
    }

    @PutMapping("/layouts/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public LayoutItem updateLayout(@PathVariable UUID spaceId, @PathVariable UUID id, @Valid @RequestBody LayoutInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId); layout(spaceId,id); ensureUnique("space_layouts", spaceId, input.name(), id);
        jdbc.update("update space_layouts set name=?,description=?,capacity=?,active=?,sort_order=?,updated_at=now() where id=? and space_id=?",
            input.name().trim(), clean(input.description()), input.capacity(), input.active(), input.sortOrder(), id, spaceId);
        return layout(spaceId,id);
    }

    @DeleteMapping("/layouts/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public void deleteLayout(@PathVariable UUID spaceId, @PathVariable UUID id, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId);
        Long references = jdbc.queryForObject("select count(*) from bookings where organization_id=? and layout_id=?", Long.class, org, id);
        if (references != null && references > 0) throw new ResponseStatusException(CONFLICT, "Layout is referenced by bookings");
        if (jdbc.update("delete from space_layouts where id=? and space_id=?", id, spaceId) == 0) throw new ResponseStatusException(NOT_FOUND, "Layout not found");
    }

    @GetMapping("/resources")
    @PreAuthorize("hasAuthority('space.read')")
    public List<ResourceItem> resources(@PathVariable UUID spaceId, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId);
        return jdbc.query("""
            select id,space_id,name,description,quantity,active,sort_order,created_at,updated_at
            from space_resources where space_id=? order by sort_order,name
            """, (rs,row) -> new ResourceItem(rs.getObject("id",UUID.class), rs.getObject("space_id",UUID.class), rs.getString("name"), rs.getString("description"),
            (Integer) rs.getObject("quantity"), rs.getBoolean("active"), rs.getInt("sort_order"), rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class)), spaceId);
    }

    @PostMapping("/resources")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public ResourceItem createResource(@PathVariable UUID spaceId, @Valid @RequestBody ResourceInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId); ensureUnique("space_resources", spaceId, input.name(), null);
        UUID id = UUID.randomUUID(); OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into space_resources(id,space_id,name,description,quantity,active,sort_order,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)",
            id, spaceId, input.name().trim(), clean(input.description()), input.quantity(), input.active(), input.sortOrder(), now, now);
        return resource(spaceId,id);
    }

    @PutMapping("/resources/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public ResourceItem updateResource(@PathVariable UUID spaceId, @PathVariable UUID id, @Valid @RequestBody ResourceInput input, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId); resource(spaceId,id); ensureUnique("space_resources", spaceId, input.name(), id);
        jdbc.update("update space_resources set name=?,description=?,quantity=?,active=?,sort_order=?,updated_at=now() where id=? and space_id=?",
            input.name().trim(), clean(input.description()), input.quantity(), input.active(), input.sortOrder(), id, spaceId);
        return resource(spaceId,id);
    }

    @DeleteMapping("/resources/{id}")
    @PreAuthorize("hasAuthority('space.manage')")
    @Transactional
    public void deleteResource(@PathVariable UUID spaceId, @PathVariable UUID id, Authentication authentication) {
        UUID org = organizationId(authentication); requireSpace(org, spaceId);
        if (jdbc.update("delete from space_resources where id=? and space_id=?", id, spaceId) == 0) throw new ResponseStatusException(NOT_FOUND, "Resource not found");
    }

    private LayoutItem layout(UUID spaceId, UUID id) {
        List<LayoutItem> rows = jdbc.query("select id,space_id,name,description,capacity,active,sort_order,created_at,updated_at from space_layouts where space_id=? and id=?",
            (rs,row) -> new LayoutItem(rs.getObject("id",UUID.class), rs.getObject("space_id",UUID.class), rs.getString("name"), rs.getString("description"), (Integer) rs.getObject("capacity"), rs.getBoolean("active"), rs.getInt("sort_order"), rs.getObject("created_at",OffsetDateTime.class), rs.getObject("updated_at",OffsetDateTime.class)), spaceId,id);
        if (rows.isEmpty()) throw new ResponseStatusException(NOT_FOUND, "Layout not found"); return rows.getFirst();
    }

    private ResourceItem resource(UUID spaceId, UUID id) {
        List<ResourceItem> rows = jdbc.query("select id,space_id,name,description,quantity,active,sort_order,created_at,updated_at from space_resources where space_id=? and id=?",
            (rs,row) -> new ResourceItem(rs.getObject("id",UUID.class), rs.getObject("space_id",UUID.class), rs.getString("name"), rs.getString("description"), (Integer) rs.getObject("quantity"), rs.getBoolean("active"), rs.getInt("sort_order"), rs.getObject("created_at",OffsetDateTime.class), rs.getObject("updated_at",OffsetDateTime.class)), spaceId,id);
        if (rows.isEmpty()) throw new ResponseStatusException(NOT_FOUND, "Resource not found"); return rows.getFirst();
    }

    private void requireSpace(UUID org, UUID spaceId) {
        Long count = jdbc.queryForObject("select count(*) from spaces where organization_id=? and id=?", Long.class, org, spaceId);
        if (count == null || count == 0) throw new ResponseStatusException(NOT_FOUND, "Space not found");
    }

    private void ensureUnique(String table, UUID spaceId, String name, UUID excludingId) {
        Long count = excludingId == null
            ? jdbc.queryForObject("select count(*) from " + table + " where space_id=? and lower(name)=lower(?)", Long.class, spaceId, name.trim())
            : jdbc.queryForObject("select count(*) from " + table + " where space_id=? and lower(name)=lower(?) and id<>?", Long.class, spaceId, name.trim(), excludingId);
        if (count != null && count > 0) throw new ResponseStatusException(CONFLICT, "Name already exists for this space");
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        return user.organizationId;
    }

    public record LayoutItem(UUID id, UUID spaceId, String name, String description, Integer capacity, boolean active, int sortOrder, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
    public record LayoutInput(@NotBlank @Size(max=200) String name, @Size(max=5000) String description, @Min(0) Integer capacity, boolean active, int sortOrder) {}
    public record ResourceItem(UUID id, UUID spaceId, String name, String description, Integer quantity, boolean active, int sortOrder, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
    public record ResourceInput(@NotBlank @Size(max=200) String name, @Size(max=5000) String description, @Min(0) Integer quantity, boolean active, int sortOrder) {}
}
