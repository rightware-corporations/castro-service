package com.castros.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/spaces/{spaceId}")
public class PublicSpaceExperienceController {
    private final JdbcTemplate jdbc;

    public PublicSpaceExperienceController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/layouts")
    public List<LayoutItem> layouts(@PathVariable UUID spaceId) {
        requireActiveSpace(spaceId);
        return jdbc.query("""
            select id, name, description, capacity, sort_order
            from space_layouts
            where space_id=? and active=true
            order by sort_order, name
            """, (rs, row) -> new LayoutItem(
            rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("description"),
            (Integer) rs.getObject("capacity"), rs.getInt("sort_order")), spaceId);
    }

    @GetMapping("/resources")
    public List<ResourceItem> resources(@PathVariable UUID spaceId) {
        requireActiveSpace(spaceId);
        return jdbc.query("""
            select id, name, description, quantity, sort_order
            from space_resources
            where space_id=? and active=true
            order by sort_order, name
            """, (rs, row) -> new ResourceItem(
            rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("description"),
            (Integer) rs.getObject("quantity"), rs.getInt("sort_order")), spaceId);
    }

    @GetMapping("/scenes")
    public List<SceneItem> scenes(@PathVariable UUID spaceId) {
        requireActiveSpace(spaceId);
        return jdbc.query("""
            select id, panorama_url, title, initial_yaw, initial_pitch, sort_order
            from space_scenes
            where space_id=?
            order by sort_order, title nulls last, id
            """, (rs, row) -> new SceneItem(
            rs.getObject("id", UUID.class), rs.getString("panorama_url"), rs.getString("title"),
            rs.getDouble("initial_yaw"), rs.getDouble("initial_pitch"), rs.getInt("sort_order")), spaceId);
    }

    @GetMapping("/scenes/{sceneId}/hotspots")
    public List<HotspotItem> hotspots(@PathVariable UUID spaceId, @PathVariable UUID sceneId) {
        requireActiveSpace(spaceId);
        Long sceneCount = jdbc.queryForObject("select count(*) from space_scenes where id=? and space_id=?", Long.class, sceneId, spaceId);
        if (sceneCount == null || sceneCount == 0) throw new ResponseStatusException(NOT_FOUND, "Scene not found");
        return jdbc.query("""
            select h.id,h.title,h.description,h.yaw,h.pitch,h.type,h.target_scene_id,h.amenity_id,r.name resource_name
            from space_hotspots h
            left join space_resources r on r.id=h.amenity_id and r.space_id=? and r.active=true
            where h.scene_id=?
            order by h.title,h.id
            """, (rs,row) -> new HotspotItem(
            rs.getObject("id",UUID.class), rs.getString("title"), rs.getString("description"),
            rs.getDouble("yaw"), rs.getDouble("pitch"), rs.getString("type"),
            rs.getObject("target_scene_id",UUID.class), rs.getObject("amenity_id",UUID.class), rs.getString("resource_name")), spaceId, sceneId);
    }

    private void requireActiveSpace(UUID spaceId) {
        Long count = jdbc.queryForObject("select count(*) from spaces where id=? and active=true", Long.class, spaceId);
        if (count == null || count == 0) throw new ResponseStatusException(NOT_FOUND, "Space not found");
    }

    public record LayoutItem(UUID id, String name, String description, Integer capacity, int sortOrder) {}
    public record ResourceItem(UUID id, String name, String description, Integer quantity, int sortOrder) {}
    public record SceneItem(UUID id, String panoramaUrl, String title, double initialYaw, double initialPitch, int sortOrder) {}
    public record HotspotItem(UUID id, String title, String description, double yaw, double pitch, String type, UUID targetSceneId, UUID resourceId, String resourceName) {}
}
