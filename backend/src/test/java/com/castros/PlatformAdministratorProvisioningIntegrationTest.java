package com.castros;

import com.castros.shared.security.PasswordPolicy;
import com.castros.shared.security.PlatformAdministratorProvisioner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class PlatformAdministratorProvisioningIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder encoder;
    @Autowired PasswordPolicy passwordPolicy;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void platformBootstrapCreatesAnIsolatedAdministratorAndCannotBeReplayed() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String email = "platform-" + suffix + "@rightware.test";
        String password = "Strong!Platform#2026";

        MockEnvironment environment = new MockEnvironment()
            .withProperty("BOOTSTRAP_PLATFORM_ADMIN_ENABLED", "true")
            .withProperty("BOOTSTRAP_PLATFORM_ADMIN_EMAIL", email)
            .withProperty("BOOTSTRAP_PLATFORM_ADMIN_PASSWORD", password)
            .withProperty("BOOTSTRAP_PLATFORM_ADMIN_FIRST_NAME", "Platform")
            .withProperty("BOOTSTRAP_PLATFORM_ADMIN_LAST_NAME", "Administrator");

        PlatformAdministratorProvisioner provisioner = new PlatformAdministratorProvisioner(jdbc, encoder, passwordPolicy, environment);
        provisioner.run(new DefaultApplicationArguments(new String[0]));

        UUID administratorId = jdbc.queryForObject("select id from platform_administrators where lower(email)=lower(?)", UUID.class, email);
        String passwordHash = jdbc.queryForObject("select password_hash from platform_administrators where id=?", String.class, administratorId);
        assertTrue(encoder.matches(password, passwordHash));

        Integer tenantCollision = jdbc.queryForObject("select count(*) from users where lower(email)=lower(?)", Integer.class, email);
        assertEquals(0, tenantCollision);

        Integer bootstrapAuditEvents = jdbc.queryForObject("select count(*) from platform_audit_events where actor_platform_admin_id=? and action='PLATFORM_ADMIN_BOOTSTRAPPED'", Integer.class, administratorId);
        assertEquals(1, bootstrapAuditEvents);

        assertThrows(IllegalStateException.class, () -> provisioner.run(new DefaultApplicationArguments(new String[0])));
        Integer platformAdminCount = jdbc.queryForObject("select count(*) from platform_administrators", Integer.class);
        assertEquals(1, platformAdminCount);
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
