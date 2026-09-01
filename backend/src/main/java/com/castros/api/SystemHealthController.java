package com.castros.api;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/system")
public class SystemHealthController {
    private final JdbcTemplate jdbc;

    public SystemHealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP");
    }

    @GetMapping("/readiness")
    public HealthResponse readiness() {
        try {
            Integer value = jdbc.queryForObject("select 1", Integer.class);
            if (value == null || value != 1) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Database readiness check failed");
            return new HealthResponse("UP");
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Database unavailable");
        }
    }

    public record HealthResponse(String status) {}
}
