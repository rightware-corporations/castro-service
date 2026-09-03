package com.castros;

import com.castros.shared.security.InitialAdministratorProvisioner;
import com.castros.shared.security.PasswordPolicy;
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
class InitialAdministratorProvisioningIntegrationTest {
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
    void bootstrapCreatesExactlyOneFullyPrivilegedOwnerAndCannotBeReplayed() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String slug = "bootstrap-" + suffix;
        String email = "initial-" + suffix + "@example.test";
        String password = "Strong!Bootstrap#2026";

        MockEnvironment environment = new MockEnvironment()
            .withProperty("BOOTSTRAP_ADMIN_ENABLED", "true")
            .withProperty("BOOTSTRAP_ORGANIZATION_NAME", "Bootstrap Test Organization")
            .withProperty("BOOTSTRAP_ORGANIZATION_SLUG", slug)
            .withProperty("BOOTSTRAP_ADMIN_EMAIL", email)
            .withProperty("BOOTSTRAP_ADMIN_PASSWORD", password)
            .withProperty("BOOTSTRAP_ADMIN_FIRST_NAME", "Initial")
            .withProperty("BOOTSTRAP_ADMIN_LAST_NAME", "Administrator");

        InitialAdministratorProvisioner provisioner = new InitialAdministratorProvisioner(jdbc, encoder, passwordPolicy, environment);
        provisioner.run(new DefaultApplicationArguments(new String[0]));

        UUID organizationId = jdbc.queryForObject("select id from organizations where slug=?", UUID.class, slug);
        UUID userId = jdbc.queryForObject("select id from users where organization_id=? and lower(email)=lower(?)", UUID.class, organizationId, email);
        String passwordHash = jdbc.queryForObject("select password_hash from users where id=?", String.class, userId);
        assertTrue(encoder.matches(password, passwordHash));

        Integer membershipCount = jdbc.queryForObject("select count(*) from organization_members where organization_id=? and user_id=?", Integer.class, organizationId, userId);
        assertEquals(1, membershipCount);
        String experience = jdbc.queryForObject("select experience_type from organization_members where organization_id=? and user_id=?", String.class, organizationId, userId);
        assertEquals("OWNER", experience);

        Integer grantedPermissions = jdbc.queryForObject("""
            select count(*) from organization_members om
            join role_permissions rp on rp.role_id=om.role_id
            where om.organization_id=? and om.user_id=?
            """, Integer.class, organizationId, userId);
        Integer permissionCatalogSize = jdbc.queryForObject("select count(*) from permissions", Integer.class);
        assertEquals(permissionCatalogSize, grantedPermissions);

        assertThrows(IllegalStateException.class, () -> provisioner.run(new DefaultApplicationArguments(new String[0])));

        Integer userCountAfterReplay = jdbc.queryForObject("select count(*) from users where organization_id=?", Integer.class, organizationId);
        assertEquals(1, userCountAfterReplay);
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
