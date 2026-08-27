package com.castros.availability;

import com.castros.booking.*;
import com.castros.shared.config.AppProperties;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AvailabilityServiceBehaviorTest {
    private final AvailabilityRuleRepository rules = mock(AvailabilityRuleRepository.class);
    private final AvailabilityExceptionRepository exceptions = mock(AvailabilityExceptionRepository.class);
    private final BlockedPeriodRepository blocked = mock(BlockedPeriodRepository.class);
    private final BookingRepository bookings = mock(BookingRepository.class);
    private final AppProperties properties = new AppProperties();
    private final AvailabilityService service = new AvailabilityService(rules, exceptions, blocked, bookings, properties);

    @Test void generatesThirtyMinuteSlotsWhenDevelopmentFallbackIsExplicitlyEnabled() {
        properties.setAvailabilityDevelopmentFallback(true);
        LocalDate date = OffsetDateTime.now(ZoneId.of("Africa/Maputo")).toLocalDate().plusDays(1);
        when(exceptions.findByBookableTypeAndBookableIdAndDate(eq(BookableType.SPACE), any(), any())).thenReturn(List.of());
        when(bookings.findOverlaps(eq(BookableType.SPACE), any(), anyCollection(), any(), any())).thenReturn(List.of());
        when(blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(eq(BookableType.SPACE), any(), any(), any())).thenReturn(List.of());
        var result = service.slots(BookableType.SPACE, UUID.randomUUID(), date, 60);
        assertEquals(17, result.slots().size());
        assertEquals("AVAILABLE", result.slots().get(0).status());
    }

    @Test void returnsNoSlotsWhenNoAvailabilityIsConfiguredByDefault() {
        LocalDate date = OffsetDateTime.now(ZoneId.of("Africa/Maputo")).toLocalDate().plusDays(1);
        when(exceptions.findByBookableTypeAndBookableIdAndDate(eq(BookableType.SPACE), any(), any())).thenReturn(List.of());
        assertTrue(service.slots(BookableType.SPACE, UUID.randomUUID(), date, 60).slots().isEmpty());
    }

    @Test void rejectsExistingOverlapButAllowsExactBoundary() {
        UUID resource = UUID.randomUUID();
        OffsetDateTime start = OffsetDateTime.parse("2026-08-28T08:00:00Z");
        OffsetDateTime end = OffsetDateTime.parse("2026-08-28T10:00:00Z");
        Booking boundary = new Booking(UUID.randomUUID(), UUID.randomUUID(), BookableType.SPACE, resource, end, end.plusHours(2), "CST-BOUNDARY");
        when(bookings.findOverlaps(eq(BookableType.SPACE), eq(resource), anyCollection(), eq(start), eq(end))).thenReturn(List.of());
        when(blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(eq(BookableType.SPACE), eq(resource), eq(end), eq(start))).thenReturn(List.of());
        assertDoesNotThrow(() -> service.assertAvailable(BookableType.SPACE, resource, start, end));
        Booking overlap = new Booking(UUID.randomUUID(), UUID.randomUUID(), BookableType.SPACE, resource, start.plusMinutes(30), end.plusHours(1), "CST-OVERLAP");
        when(bookings.findOverlaps(eq(BookableType.SPACE), eq(resource), anyCollection(), eq(start), eq(end))).thenReturn(List.of(overlap));
        assertThrows(RuntimeException.class, () -> service.assertAvailable(BookableType.SPACE, resource, start, end));
    }

    @Test void rejectsBlockedPeriod() {
        UUID resource = UUID.randomUUID();
        OffsetDateTime start = OffsetDateTime.parse("2026-08-28T08:00:00Z");
        OffsetDateTime end = OffsetDateTime.parse("2026-08-28T10:00:00Z");
        BlockedPeriod period = mock(BlockedPeriod.class);
        period.startAt = start.plusMinutes(30); period.endAt = end.plusMinutes(30);
        when(bookings.findOverlaps(eq(BookableType.SPACE), eq(resource), anyCollection(), eq(start), eq(end))).thenReturn(List.of());
        when(blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(eq(BookableType.SPACE), eq(resource), eq(end), eq(start))).thenReturn(List.of(period));
        assertThrows(RuntimeException.class, () -> service.assertAvailable(BookableType.SPACE, resource, start, end));
    }
}
