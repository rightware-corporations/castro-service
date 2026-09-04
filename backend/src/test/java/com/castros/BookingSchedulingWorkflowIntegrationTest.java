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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
class BookingSchedulingWorkflowIntegrationTest {
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
    void secretaryCanInspectSelfExcludedSlotsRescheduleAndCancelWithoutAllowingDoubleBooking() throws Exception {
        UUID organizationId = seedOrganization("booking-scheduling");
        UUID serviceId = seedService(organizationId);
        LocalDate date = LocalDate.now(ZoneId.of("Africa/Maputo")).plusDays(10);
        seedAvailability(organizationId, serviceId, date);
        UserAccount secretary = seedOperationsRecipient(organizationId);

        createPublicBooking(serviceId, date, "09:00", "10:00", "Ana", "ana-" + UUID.randomUUID() + "@example.test", "booking-a-" + UUID.randomUUID());
        createPublicBooking(serviceId, date, "10:00", "11:00", "Bia", "bia-" + UUID.randomUUID() + "@example.test", "booking-b-" + UUID.randomUUID());
        assertEquals(2, notificationCount(organizationId, "BOOKING_CREATED"));

        OffsetDateTime firstStart = at(date, 9, 0);
        OffsetDateTime secondStart = at(date, 10, 0);
        UUID firstBookingId = bookingId(organizationId, firstStart);
        UUID secondBookingId = bookingId(organizationId, secondStart);

        mvc.perform(get("/api/v1/operations/bookings/{id}/schedule/slots", firstBookingId)
                .param("date", date.toString()).with(as(secretary, "booking.update")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slots[0].start").value("09:00"))
            .andExpect(jsonPath("$.slots[0].status").value("AVAILABLE"))
            .andExpect(jsonPath("$.slots[1].start").value("10:00"))
            .andExpect(jsonPath("$.slots[1].status").value("BOOKED"))
            .andExpect(jsonPath("$.slots[2].start").value("11:00"))
            .andExpect(jsonPath("$.slots[2].status").value("AVAILABLE"));

        mvc.perform(patch("/api/v1/operations/bookings/{id}/schedule", firstBookingId)
                .with(as(secretary, "booking.update")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"date\":\"" + date + "\",\"startTime\":\"11:00\",\"endTime\":\"12:00\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(firstBookingId.toString()))
            .andExpect(jsonPath("$.startAt").value(at(date, 11, 0).toString()));

        assertEquals(1, notificationCount(organizationId, "BOOKING_RESCHEDULED"));

        mvc.perform(patch("/api/v1/operations/bookings/{id}/schedule", secondBookingId)
                .with(as(secretary, "booking.update")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"date\":\"" + date + "\",\"startTime\":\"11:00\",\"endTime\":\"12:00\"}"))
            .andExpect(status().isConflict());

        mvc.perform(patch("/api/v1/operations/bookings/{id}/status", firstBookingId)
                .with(as(secretary, "booking.update")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CANCELLED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        assertEquals(1, notificationCount(organizationId, "BOOKING_CANCELLED"));

        mvc.perform(get("/api/v1/operations/bookings/{id}/schedule/slots", firstBookingId)
                .param("date", date.toString()).with(as(secretary, "booking.update")))
            .andExpect(status().isConflict());
    }

    @Test
    void blockedPeriodsRemainUnavailableToTheSchedulingEngine() throws Exception {
        UUID organizationId = seedOrganization("booking-blocked-period");
        UUID serviceId = seedService(organizationId);
        LocalDate date = LocalDate.now(ZoneId.of("Africa/Maputo")).plusDays(12);
        seedAvailability(organizationId, serviceId, date);
        UserAccount secretary = seedOperationsRecipient(organizationId);

        mvc.perform(post("/api/v1/operations/availability/blocked-periods")
                .with(as(secretary, "availability.manage")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"bookableType\":\"SERVICE\",\"bookableId\":\"" + serviceId + "\",\"startAt\":\"" + at(date, 10, 0)
                    + "\",\"endAt\":\"" + at(date, 11, 0) + "\",\"reason\":\"Telefone\"}"))
            .andExpect(status().isCreated());

        mvc.perform(get("/api/v1/availability")
                .param("bookableType", "SERVICE").param("bookableId", serviceId.toString())
                .param("date", date.toString()).param("durationMinutes", "60"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slots[1].start").value("10:00"))
            .andExpect(jsonPath("$.slots[1].status").value("BOOKED"));
    }

    private void createPublicBooking(UUID serviceId, LocalDate date, String start, String end, String firstName, String email, String key) throws Exception {
        mvc.perform(post("/api/v1/bookings").header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"bookableType\":\"SERVICE\",\"bookableId\":\"" + serviceId + "\",\"date\":\"" + date
                    + "\",\"startTime\":\"" + start + "\",\"endTime\":\"" + end
                    + "\",\"customer\":{\"firstName\":\"" + firstName + "\",\"email\":\"" + email + "\"}}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PENDING"));
    }

    private UUID seedService(UUID organizationId) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
            insert into services(id,organization_id,name,slug,short_description,description,duration_minutes,
                                 booking_enabled,featured,active,sort_order,created_at,confirmation_mode)
            values (?,?,?,?,?,?,?,true,false,true,0,?,'MANUAL')
            """, id, organizationId, "Scheduling service", "scheduling-" + id, "Scheduling", "Scheduling", 60, OffsetDateTime.now());
        return id;
    }

    private void seedAvailability(UUID organizationId, UUID serviceId, LocalDate date) {
        jdbc.update("""
            insert into availability_rules(id,organization_id,bookable_type,bookable_id,day_of_week,opens_at,closes_at,
                                           slot_interval_minutes,buffer_before_minutes,buffer_after_minutes,minimum_notice_minutes,
                                           maximum_advance_days,active)
            values (?,?,?,?,?,?,?,?,?,?,?,?,true)
            """, UUID.randomUUID(), organizationId, "SERVICE", serviceId, date.getDayOfWeek().name(), LocalTime.of(9, 0), LocalTime.of(12, 0),
            60, 0, 0, 0, 90);
    }

    private UserAccount seedOperationsRecipient(UUID organizationId) {
        UUID userId = UUID.randomUUID();
        String email = "booking-secretary-" + userId + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            userId, organizationId, email, "unused", "Booking", "Secretary", OffsetDateTime.now());
        UUID roleId = UUID.randomUUID();
        jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", roleId, organizationId, "Booking Secretary " + roleId);
        jdbc.update("insert into organization_members(id,organization_id,user_id,role_id) values (?,?,?,?)", UUID.randomUUID(), organizationId, userId, roleId);
        UUID notificationPermission = jdbc.queryForObject("select id from permissions where code='notification.read'", UUID.class);
        jdbc.update("insert into role_permissions(id,role_id,permission_id) values (?,?,?)", UUID.randomUUID(), roleId, notificationPermission);
        UserAccount user = new UserAccount(organizationId, email, "unused", "Booking", "Secretary");
        user.id = userId;
        return user;
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)",
            id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }

    private UUID bookingId(UUID organizationId, OffsetDateTime startAt) {
        return jdbc.queryForObject("select id from bookings where organization_id=? and start_at=?", UUID.class, organizationId, startAt);
    }

    private int notificationCount(UUID organizationId, String type) {
        Integer value = jdbc.queryForObject("select count(*) from notifications where organization_id=? and type=?", Integer.class, organizationId, type);
        return value == null ? 0 : value;
    }

    private OffsetDateTime at(LocalDate date, int hour, int minute) {
        return ZonedDateTime.of(date, LocalTime.of(hour, minute), ZoneId.of("Africa/Maputo")).toOffsetDateTime();
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
