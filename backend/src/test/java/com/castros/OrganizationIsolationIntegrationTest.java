package com.castros;

import com.castros.api.InternalSpaceSceneAdminController;
import com.castros.user.UserAccount;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class OrganizationIsolationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired InternalSpaceSceneAdminController scenes;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void membershipDatabaseConstraintsRejectCrossOrganizationUserAndRole() {
        UUID orgA = organization("isolation-a");
        UUID orgB = organization("isolation-b");
        UUID userA = user(orgA, "a");
        UUID userB = user(orgB, "b");
        UUID roleA = role(orgA, "Role A");
        UUID roleB = role(orgB, "Role B");

        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
            "insert into organization_members(id,organization_id,user_id,role_id) values (?,?,?,?)",
            UUID.randomUUID(), orgA, userB, roleA));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
            "insert into organization_members(id,organization_id,user_id,role_id) values (?,?,?,?)",
            UUID.randomUUID(), orgA, userA, roleB));
    }

    @Test
    void sceneAdministrationCannotReadAnotherOrganizationsSpace() {
        UUID orgA = organization("scene-a");
        UUID orgB = organization("scene-b");
        UUID spaceB = UUID.randomUUID();
        jdbc.update("insert into spaces(id,organization_id,name,slug,active) values (?,?,?,?,true)",
            spaceB, orgB, "Isolation Space", "isolation-space-" + suffix());
        jdbc.update("insert into space_scenes(id,space_id,panorama_url,title,initial_yaw,initial_pitch,sort_order) values (?,?,?,?,0,0,0)",
            UUID.randomUUID(), spaceB, "https://example.invalid/panorama.jpg", "Isolation scene");

        UserAccount actor = new UserAccount(orgA, "actor-" + suffix() + "@example.invalid", "unused", "Actor", "A");
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(actor, null, actor.getAuthorities());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> scenes.list(spaceB, authentication));
        assertEquals(404, exception.getStatusCode().value());
    }

    private UUID organization(String prefix) {
        UUID id = UUID.randomUUID();
        String suffix = suffix();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,?,?)",
            id, prefix + "-" + suffix, prefix + "-" + suffix, true, OffsetDateTime.now());
        return id;
    }

    private UUID user(UUID org, String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, org, prefix + "-" + suffix() + "@example.invalid", "unused", "User", prefix, OffsetDateTime.now());
        return id;
    }

    private UUID role(UUID org, String name) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", id, org, name + " " + suffix());
        return id;
    }

    private static String suffix() { return UUID.randomUUID().toString().substring(0, 8); }
    private static String env(String key, String fallback) { String value = System.getenv(key); return value == null || value.isBlank() ? fallback : value; }
}
