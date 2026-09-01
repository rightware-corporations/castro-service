package com.castros;

import com.castros.availability.AvailabilityExceptionRepository;
import com.castros.availability.AvailabilityRule;
import com.castros.availability.AvailabilityRuleRepository;
import com.castros.availability.AvailabilityService;
import com.castros.availability.BlockedPeriodRepository;
import com.castros.booking.BookableType;
import com.castros.booking.Booking;
import com.castros.booking.BookingApplicationService;
import com.castros.booking.BookingRepository;
import com.castros.catalog.CourseSessionRepository;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.SpaceRepository;
import com.castros.customer.CustomerRepository;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.config.AppProperties;
import com.castros.shared.exception.ApiException;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReliabilityRegressionTest {
    @Test
    void idempotencyKeyCannotBeReusedForDifferentBookingRequest() {
        BookingRepository bookings = mock(BookingRepository.class);
        CustomerRepository customers = mock(CustomerRepository.class);
        OrganizationRepository organizations = mock(OrganizationRepository.class);
        ServiceRepository services = mock(ServiceRepository.class);
        SpaceRepository spaces = mock(SpaceRepository.class);
        CourseSessionRepository sessions = mock(CourseSessionRepository.class);
        AvailabilityService availability = mock(AvailabilityService.class);
        BookingApplicationService application = new BookingApplicationService(bookings, customers, organizations, services, spaces, sessions, availability);

        UUID org = UUID.randomUUID();
        UUID resource = UUID.randomUUID();
        Booking prior = new Booking(org, UUID.randomUUID(), BookableType.SPACE, resource, OffsetDateTime.now().plusDays(3), OffsetDateTime.now().plusDays(3).plusHours(1), "CST-PRIOR");
        prior.idempotencyKey = "retry-key";
        prior.idempotencyFingerprint = "fingerprint-from-another-request";
        when(bookings.findByOrganizationIdAndIdempotencyKey(org, "retry-key")).thenReturn(Optional.of(prior));

        BookingApplicationService.BookingRequest request = request(resource, LocalDate.now().plusDays(4), LocalTime.of(9, 0));
        assertThrows(ApiException.class, () -> application.createForOrganization(org, request, ZoneId.of("Africa/Maputo"), "retry-key", "PUBLIC_BOOKING"));
        verify(availability, never()).assertAvailable(any(), any(), any(), any());
    }

    @Test
    void idempotencyKeyLengthIsBoundedBeforeAnyMutation() {
        BookingRepository bookings = mock(BookingRepository.class);
        CustomerRepository customers = mock(CustomerRepository.class);
        OrganizationRepository organizations = mock(OrganizationRepository.class);
        ServiceRepository services = mock(ServiceRepository.class);
        SpaceRepository spaces = mock(SpaceRepository.class);
        CourseSessionRepository sessions = mock(CourseSessionRepository.class);
        AvailabilityService availability = mock(AvailabilityService.class);
        BookingApplicationService application = new BookingApplicationService(bookings, customers, organizations, services, spaces, sessions, availability);

        assertThrows(ApiException.class, () -> application.createForOrganization(UUID.randomUUID(), request(UUID.randomUUID(), LocalDate.now().plusDays(4), LocalTime.of(9, 0)), ZoneId.of("Africa/Maputo"), "x".repeat(256), "PUBLIC_BOOKING"));
        verify(availability, never()).assertAvailable(any(), any(), any(), any());
    }

    @Test
    void minimumNoticeAndMaximumAdvanceAreEnforced() {
        AvailabilityRuleRepository rules = mock(AvailabilityRuleRepository.class);
        AvailabilityExceptionRepository exceptions = mock(AvailabilityExceptionRepository.class);
        BlockedPeriodRepository blocked = mock(BlockedPeriodRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        AppProperties properties = new AppProperties();
        AvailabilityService service = new AvailabilityService(rules, exceptions, blocked, bookings, properties);
        UUID resource = UUID.randomUUID();
        ZoneId zone = ZoneId.of(properties.getBusinessTimezone());
        LocalDate tomorrow = OffsetDateTime.now().atZoneSameInstant(zone).toLocalDate().plusDays(1);

        AvailabilityRule rule = mock(AvailabilityRule.class);
        rule.bookableType = BookableType.SPACE;
        rule.bookableId = resource;
        rule.dayOfWeek = tomorrow.getDayOfWeek();
        rule.opensAt = LocalTime.of(8, 0);
        rule.closesAt = LocalTime.of(17, 0);
        rule.slotIntervalMinutes = 30;
        rule.minimumNoticeMinutes = 60 * 48;
        rule.maximumAdvanceDays = 7;
        rule.active = true;
        when(rules.findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(BookableType.SPACE, resource, tomorrow.getDayOfWeek())).thenReturn(List.of(rule));
        when(exceptions.findByBookableTypeAndBookableIdAndDate(BookableType.SPACE, resource, tomorrow)).thenReturn(List.of());
        when(bookings.findOverlaps(eq(BookableType.SPACE), eq(resource), anyCollection(), any(), any())).thenReturn(List.of());
        when(blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(eq(BookableType.SPACE), eq(resource), any(), any())).thenReturn(List.of());

        var near = service.slots(BookableType.SPACE, resource, tomorrow, 60);
        assertTrue(near.slots().stream().allMatch(slot -> "BOOKED".equals(slot.status())));

        LocalDate tooFar = tomorrow.plusDays(8);
        rule.dayOfWeek = tooFar.getDayOfWeek();
        when(rules.findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(BookableType.SPACE, resource, tooFar.getDayOfWeek())).thenReturn(List.of(rule));
        when(exceptions.findByBookableTypeAndBookableIdAndDate(BookableType.SPACE, resource, tooFar)).thenReturn(List.of());
        assertTrue(service.slots(BookableType.SPACE, resource, tooFar, 60).slots().isEmpty());
    }

    @Test
    void bookingBuffersBlockOtherwiseAdjacentSlots() {
        AvailabilityRuleRepository rules = mock(AvailabilityRuleRepository.class);
        AvailabilityExceptionRepository exceptions = mock(AvailabilityExceptionRepository.class);
        BlockedPeriodRepository blocked = mock(BlockedPeriodRepository.class);
        BookingRepository bookings = mock(BookingRepository.class);
        AppProperties properties = new AppProperties();
        AvailabilityService service = new AvailabilityService(rules, exceptions, blocked, bookings, properties);
        UUID resource = UUID.randomUUID();
        ZoneId zone = ZoneId.of(properties.getBusinessTimezone());
        LocalDate date = OffsetDateTime.now().atZoneSameInstant(zone).toLocalDate().plusDays(2);

        AvailabilityRule rule = mock(AvailabilityRule.class);
        rule.bookableType = BookableType.SPACE;
        rule.bookableId = resource;
        rule.dayOfWeek = date.getDayOfWeek();
        rule.opensAt = LocalTime.of(8, 0);
        rule.closesAt = LocalTime.of(12, 0);
        rule.slotIntervalMinutes = 30;
        rule.bufferBeforeMinutes = 30;
        rule.bufferAfterMinutes = 30;
        rule.maximumAdvanceDays = 90;
        rule.active = true;
        when(rules.findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(BookableType.SPACE, resource, date.getDayOfWeek())).thenReturn(List.of(rule));
        when(exceptions.findByBookableTypeAndBookableIdAndDate(BookableType.SPACE, resource, date)).thenReturn(List.of());
        when(blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(eq(BookableType.SPACE), eq(resource), any(), any())).thenReturn(List.of());

        OffsetDateTime existingStart = date.atTime(10, 0).atZone(zone).toOffsetDateTime();
        Booking existing = new Booking(UUID.randomUUID(), UUID.randomUUID(), BookableType.SPACE, resource, existingStart, existingStart.plusHours(1), "CST-BUFFER");
        when(bookings.findOverlaps(eq(BookableType.SPACE), eq(resource), anyCollection(), any(), any())).thenReturn(List.of(existing));

        var result = service.slots(BookableType.SPACE, resource, date, 60);
        assertEquals("BOOKED", result.slots().stream().filter(slot -> "09:00".equals(slot.start())).findFirst().orElseThrow().status());
    }

    private BookingApplicationService.BookingRequest request(UUID resource, LocalDate date, LocalTime start) {
        return new BookingApplicationService.BookingRequest(
            BookableType.SPACE, resource, date, start, start.plusHours(1), 2,
            new BookingApplicationService.CustomerInput("Reliability", "Test", "reliability@example.test", null),
            new BookingApplicationService.SpaceConfiguration(null, "TEST", List.of()), null
        );
    }
}
