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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class AvailabilityIsolationIntegrationTest {
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
    void rulesExceptionsAndBlockedPeriodsAreOrganizationScoped() throws Exception {
        UUID orgA = seedOrganization("availability-a");
        UUID orgB = seedOrganization("availability-b");
        UserAccount actor = seedUser(orgA);
        UUID bookableA = UUID.randomUUID();
        UUID bookableB = UUID.randomUUID();
        UUID ruleA = seedRule(orgA, bookableA);
        UUID ruleB = seedRule(orgB, bookableB);
        UUID exceptionA = seedException(orgA, bookableA);
        UUID exceptionB = seedException(orgB, bookableB);
        UUID blockedA = seedBlockedPeriod(orgA, bookableA);
        UUID blockedB = seedBlockedPeriod(orgB, bookableB);

        mvc.perform(get("/api/v1/operations/availability/rules").with(as(actor, "availability.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(ruleA.toString()));
        mvc.perform(get("/api/v1/operations/availability/exceptions").with(as(actor, "availability.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(exceptionA.toString()));
        mvc.perform(get("/api/v1/operations/availability/blocked-periods").with(as(actor, "availability.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(blockedA.toString()));

        mvc.perform(put("/api/v1/operations/availability/rules/{id}", ruleB).with(as(actor, "availability.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"bookableType\":\"SPACE\",\"bookableId\":\"" + bookableA + "\",\"dayOfWeek\":\"MONDAY\",\"opensAt\":\"09:00:00\",\"closesAt\":\"17:00:00\",\"slotIntervalMinutes\":30,\"bufferBeforeMinutes\":0,\"bufferAfterMinutes\":0,\"minimumNoticeMinutes\":0,\"maximumAdvanceDays\":90,\"active\":true}"))
            .andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/operations/availability/exceptions/{id}", exceptionB).with(as(actor, "availability.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"bookableType\":\"SPACE\",\"bookableId\":\"" + bookableA + "\",\"date\":\"" + LocalDate.now().plusDays(10) + "\",\"closed\":true}"))
            .andExpect(status().isNotFound());
        OffsetDateTime start = OffsetDateTime.now().plusDays(10);
        mvc.perform(put("/api/v1/operations/availability/blocked-periods/{id}", blockedB).with(as(actor, "availability.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"bookableType\":\"SPACE\",\"bookableId\":\"" + bookableA + "\",\"startAt\":\"" + start + "\",\"endAt\":\"" + start.plusHours(1) + "\",\"reason\":\"test\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void availabilityAdminRequiresAuthorities() throws Exception {
        UserAccount actor = seedUser(seedOrganization("availability-auth"));
        mvc.perform(get("/api/v1/operations/availability/rules").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/availability/exceptions").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/availability/blocked-periods").with(as(actor))).andExpect(status().isForbidden());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }
    private UserAccount seedUser(UUID org) {
        UUID id = UUID.randomUUID(); String email = "availability-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", "Availability", "Actor", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", "Availability", "Actor"); user.id = id; return user;
    }
    private UUID seedRule(UUID org, UUID bookable) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into availability_rules(id,organization_id,bookable_type,bookable_id,day_of_week,opens_at,closes_at,slot_interval_minutes,buffer_before_minutes,buffer_after_minutes,minimum_notice_minutes,maximum_advance_days,active) values (?,?,?,?,?,?,?,?,?,?,?,?,true)",
            id, org, "SPACE", bookable, "MONDAY", LocalTime.of(9,0), LocalTime.of(17,0), 30, 0, 0, 0, 90);
        return id;
    }
    private UUID seedException(UUID org, UUID bookable) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into availability_exceptions(id,organization_id,bookable_type,bookable_id,date,closed) values (?,?,?,?,?,true)", id, org, "SPACE", bookable, LocalDate.now().plusDays(5));
        return id;
    }
    private UUID seedBlockedPeriod(UUID org, UUID bookable) {
        UUID id = UUID.randomUUID(); OffsetDateTime start = OffsetDateTime.now().plusDays(20);
        jdbc.update("insert into blocked_periods(id,organization_id,bookable_type,bookable_id,start_at,end_at,reason) values (?,?,?,?,?,?,?)", id, org, "SPACE", bookable, start, start.plusHours(1), "seed");
        return id;
    }
    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
