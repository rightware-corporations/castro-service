package com.castros;

import com.castros.user.UserAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
class CourseRegistrationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void publicRegistrationIsIdempotentDoesNotCreateBookingAndCanBeManagedInternally() throws Exception {
        UUID organizationId = seedOrganization("training-registration");
        UUID courseId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.now().plusDays(20).withSecond(0).withNano(0);
        OffsetDateTime endsAt = startsAt.plusHours(3);
        jdbc.update("insert into courses(id,organization_id,name,slug,description,active) values (?,?,?,?,?,true)",
            courseId, organizationId, "Leadership", "leadership-" + courseId, "Training", true);
        jdbc.update("insert into course_sessions(id,course_id,start_at,end_at,active) values (?,?,?,?,true)",
            sessionId, courseId, startsAt, endsAt);

        UserAccount secretary = seedOperationsRecipient(organizationId);
        String key = "training-registration-" + UUID.randomUUID();
        String body = "{\"firstName\":\"Ana\",\"lastName\":\"Silva\",\"email\":\"ana-" + UUID.randomUUID()
            + "@example.test\",\"phone\":\"+258840000000\",\"participantCount\":3,\"organizationName\":\"Empresa X\",\"notes\":\"Equipa de liderança\"}";

        MvcResult first = mvc.perform(post("/api/v1/course-sessions/{sessionId}/registrations", sessionId)
                .header("Idempotency-Key", key).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.courseSessionId").value(sessionId.toString()))
            .andExpect(jsonPath("$.participantCount").value(3))
            .andReturn();

        String firstJson = first.getResponse().getContentAsString();
        assertTrue(firstJson.contains("TRN-"));

        mvc.perform(post("/api/v1/course-sessions/{sessionId}/registrations", sessionId)
                .header("Idempotency-Key", key).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.participantCount").value(3));

        String changedBody = body.replace("\"participantCount\":3", "\"participantCount\":4");
        mvc.perform(post("/api/v1/course-sessions/{sessionId}/registrations", sessionId)
                .header("Idempotency-Key", key).contentType(MediaType.APPLICATION_JSON).content(changedBody))
            .andExpect(status().isConflict());

        assertEquals(1, count("course_registrations", organizationId));
        assertEquals(0, count("bookings", organizationId));
        assertEquals(1, notificationCount(organizationId, "COURSE_REGISTRATION_CREATED"));

        UUID registrationId = jdbc.queryForObject("select id from course_registrations where organization_id=?", UUID.class, organizationId);
        mvc.perform(get("/api/v1/operations/course-registrations").with(as(secretary, "course.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(registrationId.toString()))
            .andExpect(jsonPath("$[0].courseName").value("Leadership"))
            .andExpect(jsonPath("$[0].participantCount").value(3))
            .andExpect(jsonPath("$[0].organizationName").value("Empresa X"));

        mvc.perform(patch("/api/v1/operations/course-registrations/{id}/status", registrationId)
                .with(as(secretary, "course.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONFIRMED\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CONFIRMED"));

        mvc.perform(patch("/api/v1/operations/course-registrations/{id}/status", registrationId)
                .with(as(secretary, "course.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CANCELLED\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));

        mvc.perform(patch("/api/v1/operations/course-registrations/{id}/status", registrationId)
                .with(as(secretary, "course.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONFIRMED\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void registrationsAreRejectedForSessionsThatAlreadyStarted() throws Exception {
        UUID organizationId = seedOrganization("training-registration-closed");
        UUID courseId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        OffsetDateTime startsAt = OffsetDateTime.now().minusHours(2);
        jdbc.update("insert into courses(id,organization_id,name,slug,description,active) values (?,?,?,?,?,true)",
            courseId, organizationId, "Past training", "past-training-" + courseId, "Past", true);
        jdbc.update("insert into course_sessions(id,course_id,start_at,end_at,active) values (?,?,?,?,true)",
            sessionId, courseId, startsAt, startsAt.plusHours(1));

        mvc.perform(post("/api/v1/course-sessions/{sessionId}/registrations", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\":\"Ana\",\"email\":\"past@example.test\",\"participantCount\":1}"))
            .andExpect(status().isConflict());

        assertEquals(0, count("course_registrations", organizationId));
    }

    private UserAccount seedOperationsRecipient(UUID organizationId) {
        UUID userId = UUID.randomUUID();
        String email = "training-secretary-" + userId + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            userId, organizationId, email, "unused", "Training", "Secretary", OffsetDateTime.now());
        UUID roleId = UUID.randomUUID();
        jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", roleId, organizationId, "Training Secretary " + roleId);
        jdbc.update("insert into organization_members(id,organization_id,user_id,role_id) values (?,?,?,?)", UUID.randomUUID(), organizationId, userId, roleId);
        UUID notificationPermission = jdbc.queryForObject("select id from permissions where code='notification.read'", UUID.class);
        jdbc.update("insert into role_permissions(id,role_id,permission_id) values (?,?,?)", UUID.randomUUID(), roleId, notificationPermission);
        UserAccount user = new UserAccount(organizationId, email, "unused", "Training", "Secretary");
        user.id = userId;
        return user;
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }

    private int count(String table, UUID organizationId) {
        Integer value = jdbc.queryForObject("select count(*) from " + table + " where organization_id=?", Integer.class, organizationId);
        return value == null ? 0 : value;
    }

    private int notificationCount(UUID organizationId, String type) {
        Integer value = jdbc.queryForObject("select count(*) from notifications where organization_id=? and type=?", Integer.class, organizationId, type);
        return value == null ? 0 : value;
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
