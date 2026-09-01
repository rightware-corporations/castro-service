package com.castros;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class PostgresCiIntegrationTest {
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void cleanPostgresAppliesCurrentSchemaAndCriticalTables() {
        Integer migrations = jdbc.queryForObject("select count(*) from flyway_schema_history where success=true", Integer.class);
        assertNotNull(migrations);
        assertTrue(migrations >= 13, "Expected all current Flyway migrations to be applied");
        assertNotNull(jdbc.queryForObject("select to_regclass('public.audit_events')", String.class));
        assertNotNull(jdbc.queryForObject("select to_regclass('public.space_scenes')", String.class));
        assertNotNull(jdbc.queryForObject("select to_regclass('public.space_hotspots')", String.class));
        assertNotNull(jdbc.queryForObject("select to_regclass('public.space_resources')", String.class));
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }
}
