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

    private void requireActiveSpace(UUID spaceId) {
        Long count = jdbc.queryForObject("select count(*) from spaces where id=? and active=true", Long.class, spaceId);
        if (count == null || count == 0) throw new ResponseStatusException(NOT_FOUND, "Space not found");
    }

    public record LayoutItem(UUID id, String name, String description, Integer capacity, int sortOrder) {}
    public record ResourceItem(UUID id, String name, String description, Integer quantity, int sortOrder) {}
}
