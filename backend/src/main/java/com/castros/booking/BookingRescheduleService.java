package com.castros.booking;

import com.castros.availability.AvailabilityService;
import com.castros.catalog.ServiceEntity;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.SpaceRepository;
import com.castros.notification.NotificationPublisher;
import com.castros.shared.config.AppProperties;
import com.castros.shared.exception.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.UUID;

@Service
public class BookingRescheduleService {
    private final BookingRepository bookings;
    private final ServiceRepository services;
    private final SpaceRepository spaces;
    private final AvailabilityService availability;
    private final AppProperties properties;
    private final NotificationPublisher notifications;

    public BookingRescheduleService(BookingRepository bookings, ServiceRepository services, SpaceRepository spaces,
                                    AvailabilityService availability, AppProperties properties,
                                    NotificationPublisher notifications) {
        this.bookings = bookings;
        this.services = services;
        this.spaces = spaces;
        this.availability = availability;
        this.properties = properties;
        this.notifications = notifications;
    }

    public AvailabilityService.AvailabilityResult slots(UUID organizationId, UUID bookingId, LocalDate date) {
        Booking booking = editableBooking(organizationId, bookingId);
        long duration = Duration.between(booking.startAt, booking.endAt).toMinutes();
        if (duration <= 0 || duration > Integer.MAX_VALUE) {
            throw new ApiException("VALIDATION_FAILED", "The booking has an invalid duration.", HttpStatus.CONFLICT);
        }
        validateBookable(organizationId, booking, duration);
        return availability.slotsForReschedule(booking.bookableType, booking.bookableId, date, (int) duration, booking.id);
    }

    @Transactional
    public Booking reschedule(UUID organizationId, UUID bookingId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Booking booking = editableBooking(organizationId, bookingId);
        LocalDateTime localStart = LocalDateTime.of(date, startTime);
        LocalDateTime localEnd = LocalDateTime.of(date, endTime);
        if (!localStart.isBefore(localEnd)) {
            throw new ApiException("VALIDATION_FAILED", "The new end time must be after the start time.", HttpStatus.BAD_REQUEST);
        }

        long requestedDuration = Duration.between(localStart, localEnd).toMinutes();
        validateBookable(organizationId, booking, requestedDuration);

        ZoneId zone = ZoneId.of(properties.getBusinessTimezone());
        OffsetDateTime start = ZonedDateTime.of(date, startTime, zone).toOffsetDateTime();
        OffsetDateTime end = ZonedDateTime.of(date, endTime, zone).toOffsetDateTime();
        availability.assertBookableSlot(booking.bookableType, booking.bookableId, start, end, booking.id);

        booking.startAt = start;
        booking.endAt = end;
        booking.updatedAt = OffsetDateTime.now();
        try {
            Booking saved = bookings.saveAndFlush(booking);
            notifications.publishToOperations(organizationId, "BOOKING_RESCHEDULED", "Marcação reagendada",
                saved.reference + " foi movida para " + saved.startAt + ".", "BOOKING", saved.id);
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new ApiException("BOOKING_SLOT_UNAVAILABLE", "The selected time slot is no longer available.", HttpStatus.CONFLICT);
        }
    }

    private Booking editableBooking(UUID organizationId, UUID bookingId) {
        Booking booking = bookings.findByOrganizationIdAndId(organizationId, bookingId)
            .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "Booking not found.", HttpStatus.NOT_FOUND));
        if (booking.status != BookingStatus.PENDING && booking.status != BookingStatus.CONFIRMED) {
            throw new ApiException("VALIDATION_FAILED", "Only pending or confirmed bookings can be rescheduled.", HttpStatus.CONFLICT);
        }
        if (booking.bookableType == BookableType.COURSE_SESSION || booking.bookableType == BookableType.CONSULTATION) {
            throw new ApiException("BOOKING_BOOKABLE_TYPE_UNSUPPORTED", "This booking type cannot be rescheduled with the slot engine.", HttpStatus.CONFLICT);
        }
        return booking;
    }

    private void validateBookable(UUID organizationId, Booking booking, long requestedDuration) {
        if (booking.bookableType == BookableType.SERVICE) {
            ServiceEntity service = services.findByOrganizationIdAndId(organizationId, booking.bookableId)
                .filter(value -> value.active && value.bookingEnabled)
                .orElseThrow(() -> new ApiException("BOOKABLE_INACTIVE", "The service is not available for scheduling.", HttpStatus.CONFLICT));
            if (service.durationMinutes == null || requestedDuration != service.durationMinutes) {
                throw new ApiException("VALIDATION_FAILED", "The new interval must match the configured service duration.", HttpStatus.BAD_REQUEST);
            }
        } else if (booking.bookableType == BookableType.SPACE) {
            spaces.findByOrganizationIdAndId(organizationId, booking.bookableId)
                .filter(value -> value.active && value.bookingEnabled)
                .orElseThrow(() -> new ApiException("BOOKABLE_INACTIVE", "The space is not available for reservation.", HttpStatus.CONFLICT));
        }
    }
}
