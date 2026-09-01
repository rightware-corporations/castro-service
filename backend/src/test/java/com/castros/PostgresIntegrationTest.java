package com.castros;

import com.castros.availability.AvailabilityService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.castros.booking.BookableType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class PostgresIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired DataSource dataSource;
    @Autowired WebApplicationContext webApplicationContext;
    private MockMvc mvc;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired AvailabilityService availabilityService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setupMockMvc() { mvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(springSecurity()).build(); }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void emptyDatabaseRunsFlywayHibernateValidationAndReadiness() throws Exception {
        Integer migrations = jdbc.queryForObject("select count(*) from flyway_schema_history where success = true", Integer.class);
        assertNotNull(migrations);
        assertTrue(migrations >= 14, "Expected all current Flyway migrations to be applied");
        assertEquals("amenities", jdbc.queryForObject("select to_regclass('public.amenities')", String.class));
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void bookingOverlapConstraintRejectsOverlappingActiveBooking() {
        UUID org = seedOrganization();
        UUID customer = seedCustomer(org);
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(3).withMinute(0).withSecond(0).withNano(0);
        UUID resource = UUID.randomUUID();
        insertBooking(org, customer, resource, start, start.plusHours(2), "CST-IT-" + UUID.randomUUID().toString().substring(0, 8));
        assertThrows(org.springframework.dao.DataAccessException.class, () -> insertBooking(org, customer, resource, start.plusMinutes(30), start.plusHours(1), "CST-IT-" + UUID.randomUUID().toString().substring(0, 8)));
    }

    @Test
    void concurrentBookingAttemptsLeaveOnlyOneCommitted() throws Exception {
        UUID org = seedOrganization();
        UUID customer = seedCustomer(org);
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(4).withMinute(0).withSecond(0).withNano(0);
        UUID resource = UUID.randomUUID();
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch go = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        Future<Boolean> first = executor.submit(() -> concurrentInsert(org, customer, resource, start, ready, go));
        Future<Boolean> second = executor.submit(() -> concurrentInsert(org, customer, resource, start, ready, go));
        ready.await(); go.countDown();
        int committed = (first.get() ? 1 : 0) + (second.get() ? 1 : 0);
        executor.shutdownNow();
        assertEquals(1, committed);
    }

    @Test
    void availabilityUsesPersistedRuleAndBlockedPeriod() {
        UUID org = seedOrganization();
        UUID resource = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(3);
        jdbc.update("insert into availability_rules (id,organization_id,bookable_type,bookable_id,day_of_week,opens_at,closes_at,slot_interval_minutes,buffer_before_minutes,buffer_after_minutes,minimum_notice_minutes,maximum_advance_days,active) values (?,?,?,?,?,?,?,?,?,?,?,?,true)",
                UUID.randomUUID(), org, "SPACE", resource, date.getDayOfWeek().name(), LocalTime.of(9, 0), LocalTime.of(11, 0), 60, 0, 0, 0, 90);
        OffsetDateTime blockStart = date.atTime(9, 30).atZone(java.time.ZoneId.of("Africa/Maputo")).toOffsetDateTime();
        jdbc.update("insert into blocked_periods (id,organization_id,bookable_type,bookable_id,start_at,end_at,reason) values (?,?,?,?,?,?,?)",
                UUID.randomUUID(), org, "SPACE", resource, blockStart, blockStart.plusHours(1), "integration test block");
        var result = availabilityService.slots(BookableType.SPACE, resource, date, 60);
        assertEquals(2, result.slots().size());
        assertTrue(result.slots().stream().allMatch(slot -> slot.status().equals("BOOKED")));
    }

    @Test
    void publicMutationRequiresCsrfAndInvalidRequestIsRejectedWithToken() throws Exception {
        seedOrganization();
        String validBody = "{\"firstName\":\"Maria\",\"lastName\":\"Silva\",\"email\":\"maria-" + UUID.randomUUID() + "@example.test\",\"type\":\"GENERAL\"}";
        mvc.perform(post("/api/v1/requests").contentType("application/json").content(validBody)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/requests").with(csrf()).contentType("application/json").content(validBody)).andExpect(status().isOk());
        String invalidBody = "{\"firstName\":\"\",\"lastName\":\"Silva\",\"email\":\"not-an-email\",\"type\":\"GENERAL\"}";
        mvc.perform(post("/api/v1/requests").with(csrf()).contentType("application/json").content(invalidBody)).andExpect(status().isBadRequest());
    }

    @Test
    void csrfEndpointDeliversReadableTokenCookie() throws Exception {
        mvc.perform(get("/api/v1/auth/csrf")).andExpect(status().isOk()).andExpect(cookie().exists("XSRF-TOKEN")).andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"));
    }

    @Test
    void loginSessionMeAndLogoutWorkWithCsrf() throws Exception {
        UUID org = seedOrganization();
        String email = "it-" + UUID.randomUUID() + "@example.test";
        jdbc.update("insert into users (id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
                UUID.randomUUID(), org, email, passwordEncoder.encode("correct-password"), "Integration", "User", OffsetDateTime.now());
        MvcResult login = mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType("application/json").content("{\"email\":\"" + email + "\",\"password\":\"correct-password\"}"))
                .andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotNull(session);
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
        mvc.perform(post("/api/v1/auth/logout").session(session).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void publicBookingRetryWithSameIdempotencyKeyReplaysOriginalBooking() throws Exception {
        UUID org = seedOrganization();
        UUID service = UUID.randomUUID();
        LocalDate date = LocalDate.now().plusDays(5);
        jdbc.update("insert into services (id,organization_id,name,slug,description,duration_minutes,booking_enabled,featured,active,sort_order,created_at) values (?,?,?,?,?, ?,true,false,true,0,?)",
                service, org, "Integration Service", "integration-" + service, "Integration only", 60, OffsetDateTime.now());
        jdbc.update("insert into availability_rules (id,organization_id,bookable_type,bookable_id,day_of_week,opens_at,closes_at,slot_interval_minutes,buffer_before_minutes,buffer_after_minutes,minimum_notice_minutes,maximum_advance_days,active) values (?,?,?,?,?,?,?,?,?,?,?,?,true)",
                UUID.randomUUID(), org, "SERVICE", service, date.getDayOfWeek().name(), LocalTime.of(9, 0), LocalTime.of(11, 0), 60, 0, 0, 0, 90);
        String body = "{\"bookableType\":\"SERVICE\",\"bookableId\":\"" + service + "\",\"date\":\"" + date + "\",\"startTime\":\"09:00:00\",\"endTime\":\"10:00:00\",\"customer\":{\"firstName\":\"Maria\",\"lastName\":\"Silva\",\"email\":\"retry-" + service + "@example.test\"}}";
        String key = "booking-retry-" + service;
        MvcResult first = mvc.perform(post("/api/v1/bookings").with(csrf()).header("Idempotency-Key", key).contentType("application/json").content(body)).andExpect(status().isOk()).andReturn();
        MvcResult second = mvc.perform(post("/api/v1/bookings").with(csrf()).header("Idempotency-Key", key).contentType("application/json").content(body)).andExpect(status().isOk()).andReturn();
        JsonNode firstJson = objectMapper.readTree(first.getResponse().getContentAsString());
        JsonNode secondJson = objectMapper.readTree(second.getResponse().getContentAsString());
        assertEquals(firstJson.get("id"), secondJson.get("id"));
        assertEquals(firstJson.get("reference"), secondJson.get("reference"));
        assertEquals(firstJson.get("status"), secondJson.get("status"));
    }

    private boolean concurrentInsert(UUID org, UUID customer, UUID resource, OffsetDateTime start, CountDownLatch ready, CountDownLatch go) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            ready.countDown(); go.await();
            try (PreparedStatement statement = connection.prepareStatement("insert into bookings (id,organization_id,customer_id,bookable_type,bookable_id,start_at,end_at,status,reference,created_at,updated_at) values (?,?,?,?,?,?,?,'PENDING',?,?,?)")) {
                statement.setObject(1, UUID.randomUUID()); statement.setObject(2, org); statement.setObject(3, customer); statement.setString(4, "SPACE"); statement.setObject(5, resource); statement.setObject(6, start); statement.setObject(7, start.plusHours(2)); statement.setString(8, "CST-CON-" + UUID.randomUUID().toString().substring(0, 16)); statement.setObject(9, OffsetDateTime.now()); statement.setObject(10, OffsetDateTime.now()); statement.executeUpdate();
            }
            connection.commit(); return true;
        } catch (Exception ex) { return false; }
    }

    private UUID seedOrganization() { UUID id = UUID.randomUUID(); jdbc.update("insert into organizations (id,name,slug,active,created_at) values (?,?,?,true,?)", id, "Integration " + id, "integration-" + id, OffsetDateTime.now()); return id; }
    private UUID seedCustomer(UUID org) { UUID id = UUID.randomUUID(); jdbc.update("insert into customers (id,organization_id,first_name,email,created_at,updated_at) values (?,?,?,?,?,?)", id, org, "Integration", "it-" + id + "@example.test", OffsetDateTime.now(), OffsetDateTime.now()); return id; }
    private void insertBooking(UUID org, UUID customer, UUID resource, OffsetDateTime start, OffsetDateTime end, String reference) { jdbc.update("insert into bookings (id,organization_id,customer_id,bookable_type,bookable_id,start_at,end_at,status,reference,created_at,updated_at) values (?,?,?,?,?,?,?,'PENDING',?,?,?)", UUID.randomUUID(), org, customer, "SPACE", resource, start, end, reference, OffsetDateTime.now(), OffsetDateTime.now()); }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
