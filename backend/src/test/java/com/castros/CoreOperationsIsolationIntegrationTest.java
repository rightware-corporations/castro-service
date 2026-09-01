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
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class CoreOperationsIsolationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext webApplicationContext;

    private MockMvc mvc;

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
    void requestsBookingsCustomersAndSummaryStayInsideAuthenticatedOrganization() throws Exception {
        UUID orgA = seedOrganization();
        UUID orgB = seedOrganization();
        UserAccount actorA = seedUser(orgA);

        UUID customerA = seedCustomer(orgA, "alpha");
        UUID customerB = seedCustomer(orgB, "beta");
        UUID requestA = seedRequest(orgA, customerA, "Alpha request");
        UUID requestB = seedRequest(orgB, customerB, "Beta request");
        UUID bookingA = seedBooking(orgA, customerA, "A");
        UUID bookingB = seedBooking(orgB, customerB, "B");

        mvc.perform(get("/api/v1/operations/summary").with(as(actorA, "dashboard.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requests").value(1))
            .andExpect(jsonPath("$.bookings").value(1))
            .andExpect(jsonPath("$.customers").value(1));

        mvc.perform(get("/api/v1/operations/requests").with(as(actorA, "request.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(requestA.toString()));

        mvc.perform(get("/api/v1/operations/requests/count").with(as(actorA, "request.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1));

        mvc.perform(get("/api/v1/operations/requests/{id}", requestB).with(as(actorA, "request.read")))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/v1/operations/requests/{id}/status", requestB)
                .with(as(actorA, "request.update"))
                .with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"CONTACTED\"}"))
            .andExpect(status().isNotFound());

        mvc.perform(get("/api/v1/operations/bookings").with(as(actorA, "booking.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(bookingA.toString()));

        mvc.perform(get("/api/v1/operations/bookings/count").with(as(actorA, "booking.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1));

        mvc.perform(get("/api/v1/operations/bookings/{id}", bookingB).with(as(actorA, "booking.read")))
            .andExpect(status().isNotFound());

        mvc.perform(patch("/api/v1/operations/bookings/{id}/status", bookingB)
                .with(as(actorA, "booking.update"))
                .with(csrf())
                .contentType("application/json")
                .content("{\"status\":\"CONFIRMED\"}"))
            .andExpect(status().isNotFound());

        mvc.perform(get("/api/v1/operations/customers").with(as(actorA, "customer.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(customerA.toString()));

        mvc.perform(get("/api/v1/operations/customers/count").with(as(actorA, "customer.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1));

        mvc.perform(get("/api/v1/operations/customers/{id}", customerB).with(as(actorA, "customer.read")))
            .andExpect(status().isNotFound());
    }

    @Test
    void coreOperationsEndpointsRejectMissingAuthorities() throws Exception {
        UUID org = seedOrganization();
        UserAccount actor = seedUser(org);

        mvc.perform(get("/api/v1/operations/summary").with(as(actor)))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/requests").with(as(actor)))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/bookings").with(as(actor)))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/customers").with(as(actor)))
            .andExpect(status().isForbidden());
    }

    private UUID seedOrganization() {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations (id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, "Core isolation " + id, "core-isolation-" + id, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID org) {
        UUID id = UUID.randomUUID();
        String email = "core-isolation-" + id + "@example.test";
        jdbc.update("insert into users (id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, org, email, "not-used", "Core", "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "not-used", "Core", "User");
        user.id = id;
        return user;
    }

    private UUID seedCustomer(UUID org, String suffix) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into customers (id,organization_id,first_name,last_name,email,created_at,updated_at) values (?,?,?,?,?,?,?)",
            id, org, "Customer", suffix, suffix + "-" + id + "@example.test", now, now);
        return id;
    }

    private UUID seedRequest(UUID org, UUID customer, String message) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into requests (id,organization_id,customer_id,type,status,message,created_at) values (?,?,?,?,?,?,?)",
            id, org, customer, "GENERAL", "NEW", message, OffsetDateTime.now());
        return id;
    }

    private UUID seedBooking(UUID org, UUID customer, String suffix) {
        UUID id = UUID.randomUUID();
        UUID bookableId = UUID.randomUUID();
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(20 + Math.abs(suffix.hashCode() % 20)).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into bookings (id,organization_id,customer_id,bookable_type,bookable_id,start_at,end_at,status,reference,created_at,updated_at) values (?,?,?,?,?,?,?,'PENDING',?,?,?)",
            id, org, customer, "SPACE", bookableId, start, start.plusHours(1), "CORE-" + suffix + "-" + id.toString().substring(0, 8), now, now);
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
