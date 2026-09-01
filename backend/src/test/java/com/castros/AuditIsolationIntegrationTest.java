package com.castros;

import com.castros.user.UserAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class AuditIsolationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach void setup() { mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build(); }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void auditTrailOnlyReturnsAuthenticatedOrganization() throws Exception {
        UUID orgA = seedOrganization("audit-a");
        UUID orgB = seedOrganization("audit-b");
        UserAccount actorA = seedUser(orgA, "actor-a");
        UserAccount actorB = seedUser(orgB, "actor-b");
        UUID eventA = seedAudit(orgA, actorA.id, "UPDATE", "SETTINGS");
        seedAudit(orgB, actorB.id, "DELETE", "CONTENT");

        mvc.perform(get("/api/v1/operations/audit").with(as(actorA, "audit.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(eventA.toString()))
            .andExpect(jsonPath("$[0].entityType").value("SETTINGS"));
    }

    @Test
    void auditTrailRequiresAuthority() throws Exception {
        UserAccount actor = seedUser(seedOrganization("audit-auth"), "actor");
        mvc.perform(get("/api/v1/operations/audit").with(as(actor))).andExpect(status().isForbidden());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }
    private UserAccount seedUser(UUID org, String prefix) {
        UUID id = UUID.randomUUID(); String email = prefix + "-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", prefix, "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", prefix, "User"); user.id = id; return user;
    }
    private UUID seedAudit(UUID org, UUID actor, String action, String entityType) {
        UUID id = UUID.randomUUID(); UUID entity = UUID.randomUUID();
        jdbc.update("insert into audit_events(id,organization_id,actor_user_id,action,entity_type,entity_id,details,created_at) values (?,?,?,?,?,?,?,?)", id, org, actor, action, entityType, entity, "integration", OffsetDateTime.now());
        return id;
    }
    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
