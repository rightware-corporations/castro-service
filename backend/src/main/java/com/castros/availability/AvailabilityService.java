package com.castros.availability;

import com.castros.booking.Booking;
import com.castros.booking.BookingRepository;
import com.castros.booking.BookingStatus;
import com.castros.booking.BookableType;
import com.castros.shared.config.AppProperties;
import com.castros.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;

@Service
public class AvailabilityService {
    private final AvailabilityRuleRepository rules;
    private final AvailabilityExceptionRepository exceptions;
    private final BlockedPeriodRepository blocked;
    private final BookingRepository bookings;
    private final AppProperties properties;

    public AvailabilityService(AvailabilityRuleRepository rules, AvailabilityExceptionRepository exceptions, BlockedPeriodRepository blocked, BookingRepository bookings, AppProperties properties) {
        this.rules = rules; this.exceptions = exceptions; this.blocked = blocked; this.bookings = bookings; this.properties = properties;
    }

    public AvailabilityResult slots(BookableType type, UUID id, LocalDate date, int durationMinutes) {
        if (durationMinutes <= 0) throw new ApiException("BOOKING_INVALID_TIME", "Duration must be positive.", HttpStatus.BAD_REQUEST);
        ZoneId zone = ZoneId.of(properties.getBusinessTimezone());
        List<AvailabilityRule> configured = rules.findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(type, id, date.getDayOfWeek());
        List<AvailabilityExceptionEntity> exceptionsForDate = exceptions.findByBookableTypeAndBookableIdAndDate(type, id, date);
        if (configured.isEmpty() && exceptionsForDate.isEmpty() && !properties.isAvailabilityDevelopmentFallback()) {
            return new AvailabilityResult(date, zone.getId(), List.of());
        }
        LocalTime open = null, close = null;
        int interval = 30, before = 0, after = 0, minNotice = 0, maxAdvance = 90;
        if (!configured.isEmpty()) {
            AvailabilityRule rule = configured.get(0); open = rule.opensAt; close = rule.closesAt; interval = rule.slotIntervalMinutes;
            before = rule.bufferBeforeMinutes; after = rule.bufferAfterMinutes; minNotice = rule.minimumNoticeMinutes; maxAdvance = rule.maximumAdvanceDays;
        } else if (properties.isAvailabilityDevelopmentFallback()) {
            open = LocalTime.of(8, 0); close = LocalTime.of(17, 0);
        }
        if (!exceptionsForDate.isEmpty()) {
            AvailabilityExceptionEntity exception = exceptionsForDate.get(0);
            if (exception.closed) return new AvailabilityResult(date, zone.getId(), List.of());
            if (exception.opensAt == null || exception.closesAt == null) return new AvailabilityResult(date, zone.getId(), List.of());
            open = exception.opensAt; close = exception.closesAt;
        }
        if (open == null || close == null) return new AvailabilityResult(date, zone.getId(), List.of());
        OffsetDateTime dayStart = ZonedDateTime.of(date, open, zone).toOffsetDateTime();
        OffsetDateTime dayEnd = ZonedDateTime.of(date, close, zone).toOffsetDateTime();
        OffsetDateTime now = OffsetDateTime.now();
        LocalDate today = now.atZoneSameInstant(zone).toLocalDate();
        if (date.isBefore(today) || date.isAfter(today.plusDays(maxAdvance))) return new AvailabilityResult(date, zone.getId(), List.of());
        List<Booking> existing = bookings.findOverlaps(type, id, activeStatuses(), dayStart.minusMinutes(after), dayEnd.plusMinutes(before));
        List<BlockedPeriod> blocks = blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(type, id, dayEnd, dayStart);
        List<AvailabilitySlot> result = new ArrayList<>();
        for (OffsetDateTime start = dayStart; !start.plusMinutes(durationMinutes).isAfter(dayEnd); start = start.plusMinutes(interval)) {
            OffsetDateTime end = start.plusMinutes(durationMinutes);
            boolean tooSoon = start.isBefore(now.plusMinutes(minNotice));
            boolean conflict = false;
            for (Booking booking : existing) if (overlap(start.minusMinutes(before), end.plusMinutes(after), booking.startAt, booking.endAt)) { conflict = true; break; }
            boolean blockedHit = false;
            for (BlockedPeriod period : blocks) if (overlap(start, end, period.startAt, period.endAt)) { blockedHit = true; break; }
            String status = tooSoon || conflict || blockedHit ? "BOOKED" : "AVAILABLE";
            result.add(new AvailabilitySlot(start.atZoneSameInstant(zone).toLocalTime().toString(), end.atZoneSameInstant(zone).toLocalTime().toString(), status));
        }
        return new AvailabilityResult(date, zone.getId(), result);
    }

    public void assertAvailable(BookableType type, UUID id, OffsetDateTime start, OffsetDateTime end) {
        if (!start.isBefore(end)) throw new ApiException("BOOKING_INVALID_TIME", "Start time must be before end time.", HttpStatus.BAD_REQUEST);
        if (!bookings.findOverlaps(type, id, activeStatuses(), start, end).isEmpty()) throw new ApiException("BOOKING_SLOT_UNAVAILABLE", "The selected time slot is no longer available.", HttpStatus.CONFLICT);
        if (!blocked.findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(type, id, end, start).isEmpty()) throw new ApiException("BOOKING_SLOT_UNAVAILABLE", "The selected time slot is blocked.", HttpStatus.CONFLICT);
    }

    private Collection<BookingStatus> activeStatuses() { return List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.NO_SHOW); }
    private boolean overlap(OffsetDateTime a, OffsetDateTime b, OffsetDateTime c, OffsetDateTime d) { return a.isBefore(d) && b.isAfter(c); }
    public record AvailabilityResult(LocalDate date, String timezone, List<AvailabilitySlot> slots) { }
    public record AvailabilitySlot(String start, String end, String status) { }
}
