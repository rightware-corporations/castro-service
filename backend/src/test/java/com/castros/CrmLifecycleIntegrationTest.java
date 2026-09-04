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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class CrmLifecycleIntegrationTest {
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
    void requestLifecyclePromotesCustomerAndRejectsCrossTenantFollowUpOwner() throws Exception {
        UUID org = seedOrganization("crm-primary");
        UserAccount actor = seedUser(org, "actor");
        UserAccount owner = seedUser(org, "owner");
        UUID customerId = seedCustomer(org, "Lead");
        UUID requestId = seedRequest(org, customerId);

        UUID foreignOrg = seedOrganization("crm-foreign");
        UserAccount foreignOwner = seedUser(foreignOrg, "foreign-owner");

        RequestPostProcessor authorized = as(actor, "request.read", "request.update", "request.assign", "customer.update");

        mvc.perform(patch("/api/v1/operations/requests/{id}/status", requestId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"CONTACTED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONTACTED"))
            .andExpect(jsonPath("$.lastContactAt").isNotEmpty())
            .andExpect(jsonPath("$.lifecycleStage").value("LEAD"));

        mvc.perform(patch("/api/v1/operations/requests/{id}/status", requestId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"QUALIFIED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("QUALIFIED"))
            .andExpect(jsonPath("$.lifecycleStage").value("QUALIFIED_LEAD"));

        mvc.perform(patch("/api/v1/operations/requests/{id}/follow-up", requestId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"ownerUserId\":\"" + owner.id + "\",\"followUpAt\":\"2026-09-10T09:00:00+02:00\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ownerUserId").value(owner.id.toString()))
            .andExpect(jsonPath("$.followUpAt").isNotEmpty());

        mvc.perform(patch("/api/v1/operations/requests/{id}/follow-up", requestId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"ownerUserId\":\"" + foreignOwner.id + "\",\"followUpAt\":\"2026-09-11T09:00:00+02:00\"}"))
            .andExpect(status().isBadRequest());

        mvc.perform(patch("/api/v1/operations/requests/{id}/status", requestId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"CONVERTED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONVERTED"))
            .andExpect(jsonPath("$.lifecycleStage").value("CUSTOMER"));

        mvc.perform(patch("/api/v1/operations/customers/{id}/lifecycle", customerId)
                .with(authorized).with(csrf())
                .contentType("application/json")
                .content("{\"stage\":\"LEAD\"}"))
            .andExpect(status().isConflict());

        String lifecycle = jdbc.queryForObject("select lifecycle_stage from customers where id=?", String.class, customerId);
        assertThat(lifecycle).isEqualTo("CUSTOMER");
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID organizationId, String prefix) {
        UUID id = UUID.randomUUID();
        String email = prefix + "-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, organizationId, email, "unused", prefix, "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(organizationId, email, "unused", prefix, "User");
        user.id = id;
        return user;
    }

    private UUID seedCustomer(UUID organizationId, String firstName) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into customers(id,organization_id,first_name,email,source,created_at,updated_at) values (?,?,?,?,?,?,?)",
            id, organizationId, firstName, "lead-" + id + "@example.test", "WEB", now, now);
        return id;
    }

    private UUID seedRequest(UUID organizationId, UUID customerId) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into requests(id,organization_id,customer_id,type,status,message,created_at) values (?,?,?,?,?,?,?)",
            id, organizationId, customerId, "CONSULTATION", "NEW", "CRM lifecycle integration test", OffsetDateTime.now());
        return id;
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
