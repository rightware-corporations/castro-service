package com.castros;

import com.castros.user.UserAccount;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class OperationsIsolationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext webApplicationContext;

    private MockMvc mvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setupMockMvc() {
        mvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void taskEndpointsRequireAuthorityAndKeepForeignOrganizationHidden() throws Exception {
        UUID orgA = seedOrganization();
        UUID orgB = seedOrganization();
        UserAccount actorA = seedUser(orgA);
        UserAccount actorB = seedUser(orgB);

        mvc.perform(get("/api/v1/operations/tasks").with(as(actorA)))
            .andExpect(status().isForbidden());

        String createBody = "{\"title\":\"Own organization task\",\"status\":\"OPEN\",\"priority\":\"NORMAL\"}";
        String createdJson = mvc.perform(post("/api/v1/operations/tasks")
                .with(as(actorA, "task.read", "task.manage"))
                .with(csrf())
                .contentType("application/json")
                .content(createBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Own organization task"))
            .andReturn().getResponse().getContentAsString();

        UUID taskId = UUID.fromString(objectMapper.readTree(createdJson).get("id").asText());

        mvc.perform(get("/api/v1/operations/tasks").with(as(actorA, "task.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(taskId.toString()));

        mvc.perform(get("/api/v1/operations/tasks").with(as(actorB, "task.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());

        mvc.perform(patch("/api/v1/operations/tasks/{id}/status", taskId)
                .with(as(actorB, "task.manage"))
                .with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"DONE\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void taskCreationRejectsForeignOrganizationReferences() throws Exception {
        UUID orgA = seedOrganization();
        UUID orgB = seedOrganization();
        UserAccount actorA = seedUser(orgA);
        UserAccount foreignUser = seedUser(orgB);

        String body = "{\"title\":\"Invalid foreign assignment\",\"status\":\"OPEN\",\"priority\":\"HIGH\",\"assignedUserId\":\"" + foreignUser.id + "\"}";
        mvc.perform(post("/api/v1/operations/tasks")
                .with(as(actorA, "task.manage"))
                .with(csrf())
                .contentType("application/json")
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    void notificationsAreScopedToOrganizationAndRecipient() throws Exception {
        UUID orgA = seedOrganization();
        UUID orgB = seedOrganization();
        UserAccount recipient = seedUser(orgA);
        UserAccount otherSameOrg = seedUser(orgA);
        UserAccount foreignRecipient = seedUser(orgB);

        UUID ownNotification = seedNotification(orgA, recipient.id, "own");
        UUID otherNotification = seedNotification(orgA, otherSameOrg.id, "other");
        UUID foreignNotification = seedNotification(orgB, foreignRecipient.id, "foreign");

        mvc.perform(get("/api/v1/operations/notifications").with(as(recipient, "notification.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(ownNotification.toString()));

        mvc.perform(patch("/api/v1/operations/notifications/{id}/read", otherNotification)
                .with(as(recipient, "notification.read"))
                .with(csrf()))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/v1/operations/notifications/{id}/read", foreignNotification)
                .with(as(recipient, "notification.read"))
                .with(csrf()))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/v1/operations/notifications/{id}/read", ownNotification)
                .with(as(recipient, "notification.read"))
                .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.readAt").isNotEmpty());
    }

    @Test
    void reportsRequireAuthorityAndCountOnlyAuthenticatedOrganization() throws Exception {
        UUID orgA = seedOrganization();
        UUID orgB = seedOrganization();
        UserAccount actorA = seedUser(orgA);
        UserAccount actorB = seedUser(orgB);

        seedTask(orgA, actorA.id, "A task");
        seedTask(orgB, actorB.id, "B task");

        OffsetDateTime from = OffsetDateTime.now(ZoneOffset.UTC).minusHours(1);
        OffsetDateTime to = OffsetDateTime.now(ZoneOffset.UTC).plusHours(1);
        String endpoint = "/api/v1/operations/reports/summary?from=" + from + "&to=" + to;

        mvc.perform(get(endpoint).with(as(actorA)))
            .andExpect(status().isForbidden());

        String json = mvc.perform(get(endpoint).with(as(actorA, "report.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tasksCreated").value(1))
            .andReturn().getResponse().getContentAsString();

        JsonNode report = objectMapper.readTree(json);
        assertEquals(1, report.get("tasksCreated").asInt());
    }

    private UUID seedOrganization() {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations (id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, "Isolation " + id, "isolation-" + id, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID org) {
        UUID id = UUID.randomUUID();
        String email = "isolation-" + id + "@example.test";
        jdbc.update("insert into users (id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, org, email, "not-used", "Isolation", "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "not-used", "Isolation", "User");
        user.id = id;
        assertNotNull(user.id);
        return user;
    }

    private UUID seedNotification(UUID org, UUID recipient, String body) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into notifications(id,organization_id,recipient_user_id,type,title,body,resource_type,resource_id,created_at) values (?,?,?,?,?,?,?,?,?)",
            id, org, recipient, "TEST", "Integration", body, null, null, OffsetDateTime.now());
        return id;
    }

    private void seedTask(UUID org, UUID creator, String title) {
        jdbc.update("insert into tasks(id,organization_id,title,status,priority,created_by,created_at,updated_at) values (?,?,?,'OPEN','NORMAL',?,?,?)",
            UUID.randomUUID(), org, title, creator, OffsetDateTime.now(), OffsetDateTime.now());
    }

    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
