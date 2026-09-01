package com.castros;

import com.castros.shared.security.DatabaseRateLimiter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class RateLimitIntegrationTest {
    @Autowired DatabaseRateLimiter limiter;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void limiterPersistsBucketsAndRejectsRequestsOverLimitWithoutStoringRawIdentity() {
        String identity = "rate-limit-" + UUID.randomUUID() + "@example.test";
        String scope = "integration-test-" + UUID.randomUUID();

        assertTrue(limiter.allow(scope, identity, 1));
        assertFalse(limiter.allow(scope, identity, 1));

        Integer matchingBuckets = jdbc.queryForObject(
            "select count(*) from request_rate_limits where bucket_key like ?",
            Integer.class,
            scope + ":%"
        );
        assertTrue(matchingBuckets != null && matchingBuckets == 1);

        Integer leakedIdentities = jdbc.queryForObject(
            "select count(*) from request_rate_limits where bucket_key like ?",
            Integer.class,
            "%" + identity + "%"
        );
        assertTrue(leakedIdentities != null && leakedIdentities == 0);
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
