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
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class AvailabilityCrudIntegrationTest {
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
    void weeklyRuleCanBeCreatedUpdatedListedAndDeleted() throws Exception {
        UUID organizationId = seedOrganization("availability-crud-rule");
        UserAccount actor = seedUser(organizationId);
        UUID bookableId = UUID.randomUUID();

        mvc.perform(post("/api/v1/operations/availability/rules")
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(ruleJson(bookableId, "MONDAY", "09:00:00", "17:00:00", 30, true)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookableType").value("SPACE"))
            .andExpect(jsonPath("$.bookableId").value(bookableId.toString()))
            .andExpect(jsonPath("$.dayOfWeek").value("MONDAY"))
            .andExpect(jsonPath("$.active").value(true));

        UUID ruleId = singleId("availability_rules", organizationId, bookableId);

        mvc.perform(put("/api/v1/operations/availability/rules/{id}", ruleId)
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(ruleJson(bookableId, "TUESDAY", "10:00:00", "16:00:00", 45, false)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(ruleId.toString()))
            .andExpect(jsonPath("$.dayOfWeek").value("TUESDAY"))
            .andExpect(jsonPath("$.slotIntervalMinutes").value(45))
            .andExpect(jsonPath("$.active").value(false));

        mvc.perform(get("/api/v1/operations/availability/rules").with(as(actor, "availability.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(ruleId.toString()))
            .andExpect(jsonPath("$[0].dayOfWeek").value("TUESDAY"));

        mvc.perform(delete("/api/v1/operations/availability/rules/{id}", ruleId)
                .with(as(actor, "availability.manage")).with(csrf()))
            .andExpect(status().isNoContent());

        assertEquals(0, count("availability_rules", organizationId, bookableId));
    }

    @Test
    void exceptionCanBeCreatedUpdatedListedAndDeleted() throws Exception {
        UUID organizationId = seedOrganization("availability-crud-exception");
        UserAccount actor = seedUser(organizationId);
        UUID bookableId = UUID.randomUUID();

        mvc.perform(post("/api/v1/operations/availability/exceptions")
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"bookableType\":\"SERVICE\",\"bookableId\":\"" + bookableId + "\",\"date\":\"2026-10-12\",\"closed\":true}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookableType").value("SERVICE"))
            .andExpect(jsonPath("$.date").value("2026-10-12"))
            .andExpect(jsonPath("$.closed").value(true));

        UUID exceptionId = singleId("availability_exceptions", organizationId, bookableId);

        mvc.perform(put("/api/v1/operations/availability/exceptions/{id}", exceptionId)
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"bookableType\":\"SERVICE\",\"bookableId\":\"" + bookableId + "\",\"date\":\"2026-10-13\",\"closed\":false,\"opensAt\":\"10:00:00\",\"closesAt\":\"14:00:00\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(exceptionId.toString()))
            .andExpect(jsonPath("$.date").value("2026-10-13"))
            .andExpect(jsonPath("$.closed").value(false));

        mvc.perform(get("/api/v1/operations/availability/exceptions").with(as(actor, "availability.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(exceptionId.toString()))
            .andExpect(jsonPath("$[0].closed").value(false));

        mvc.perform(delete("/api/v1/operations/availability/exceptions/{id}", exceptionId)
                .with(as(actor, "availability.manage")).with(csrf()))
            .andExpect(status().isNoContent());

        assertEquals(0, count("availability_exceptions", organizationId, bookableId));
    }

    @Test
    void blockedPeriodCanBeCreatedUpdatedListedAndDeleted() throws Exception {
        UUID organizationId = seedOrganization("availability-crud-blocked");
        UserAccount actor = seedUser(organizationId);
        UUID bookableId = UUID.randomUUID();

        mvc.perform(post("/api/v1/operations/availability/blocked-periods")
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(blockedPeriodJson(bookableId, "2026-10-20T09:00:00+02:00", "2026-10-20T11:00:00+02:00", " maintenance ")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookableType").value("SPACE"))
            .andExpect(jsonPath("$.bookableId").value(bookableId.toString()))
            .andExpect(jsonPath("$.reason").value("maintenance"));

        UUID blockedPeriodId = singleId("blocked_periods", organizationId, bookableId);

        mvc.perform(put("/api/v1/operations/availability/blocked-periods/{id}", blockedPeriodId)
                .with(as(actor, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(blockedPeriodJson(bookableId, "2026-10-21T13:00:00+02:00", "2026-10-21T15:00:00+02:00", "updated")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(blockedPeriodId.toString()))
            .andExpect(jsonPath("$.reason").value("updated"));

        mvc.perform(get("/api/v1/operations/availability/blocked-periods").with(as(actor, "availability.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(blockedPeriodId.toString()))
            .andExpect(jsonPath("$[0].reason").value("updated"));

        mvc.perform(delete("/api/v1/operations/availability/blocked-periods/{id}", blockedPeriodId)
                .with(as(actor, "availability.manage")).with(csrf()))
            .andExpect(status().isNoContent());

        assertEquals(0, count("blocked_periods", organizationId, bookableId));
    }

    private String ruleJson(UUID bookableId, String day, String opensAt, String closesAt, int interval, boolean active) {
        return "{\"bookableType\":\"SPACE\",\"bookableId\":\"" + bookableId + "\",\"dayOfWeek\":\"" + day
            + "\",\"opensAt\":\"" + opensAt + "\",\"closesAt\":\"" + closesAt + "\",\"slotIntervalMinutes\":" + interval
            + ",\"bufferBeforeMinutes\":5,\"bufferAfterMinutes\":10,\"minimumNoticeMinutes\":60,\"maximumAdvanceDays\":90,\"active\":" + active + "}";
    }

    private String blockedPeriodJson(UUID bookableId, String startAt, String endAt, String reason) {
        return "{\"bookableType\":\"SPACE\",\"bookableId\":\"" + bookableId + "\",\"startAt\":\"" + startAt
            + "\",\"endAt\":\"" + endAt + "\",\"reason\":\"" + reason + "\"}";
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID organizationId) {
        UUID id = UUID.randomUUID();
        String email = "availability-crud-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, organizationId, email, "unused", "Availability", "Crud", OffsetDateTime.now());
        UserAccount user = new UserAccount(organizationId, email, "unused", "Availability", "Crud");
        user.id = id;
        return user;
    }

    private UUID singleId(String table, UUID organizationId, UUID bookableId) {
        return jdbc.queryForObject("select id from " + table + " where organization_id=? and bookable_id=?", UUID.class, organizationId, bookableId);
    }

    private int count(String table, UUID organizationId, UUID bookableId) {
        Integer value = jdbc.queryForObject("select count(*) from " + table + " where organization_id=? and bookable_id=?", Integer.class, organizationId, bookableId);
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
