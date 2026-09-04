package com.castros.booking;

import com.castros.availability.AvailabilityService;
import com.castros.catalog.CourseSessionRepository;
import com.castros.catalog.ServiceEntity;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.Space;
import com.castros.catalog.SpaceRepository;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.*;
import java.util.*;

@Service
public class BookingApplicationService {
    private final BookingRepository bookings;
    private final CustomerRepository customers;
    private final OrganizationRepository organizations;
    private final ServiceRepository services;
    private final SpaceRepository spaces;
    private final CourseSessionRepository courseSessions;
    private final AvailabilityService availability;

    public BookingApplicationService(BookingRepository bookings, CustomerRepository customers, OrganizationRepository organizations,
                                     ServiceRepository services, SpaceRepository spaces, CourseSessionRepository courseSessions,
                                     AvailabilityService availability) {
        this.bookings = bookings;
        this.customers = customers;
        this.organizations = organizations;
        this.services = services;
        this.spaces = spaces;
        this.courseSessions = courseSessions;
        this.availability = availability;
    }

    @Transactional
    public Booking create(BookingRequest request, ZoneId zone, String idempotencyKey) {
        UUID org = resolvePublicOrganization(request);
        return createForOrganization(org, request, zone, idempotencyKey, "PUBLIC_BOOKING");
    }

    @Transactional
    public Booking createForOrganization(UUID organizationId, BookingRequest request, ZoneId zone, String idempotencyKey, String customerSource) {
        String normalizedKey = normalizeKey(idempotencyKey);
        String fingerprint = fingerprint(request, zone);
        if (normalizedKey != null) {
            Optional<Booking> prior = bookings.findByOrganizationIdAndIdempotencyKey(organizationId, normalizedKey);
            if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
        }

        validateResourceAndBusinessRules(organizationId, request, zone);
        OffsetDateTime start = ZonedDateTime.of(request.date(), request.startTime(), zone).toOffsetDateTime();
        OffsetDateTime end = ZonedDateTime.of(request.date(), request.endTime(), zone).toOffsetDateTime();
        availability.assertAvailable(request.bookableType(), request.bookableId(), start, end);

        Customer customer = findOrCreateCustomer(organizationId, request.customer(), customerSource);
        Booking booking = new Booking(organizationId, customer.id, request.bookableType(), request.bookableId(), start, end, reference());
        booking.notes = request.notes();
        booking.participants = request.participants();
        booking.idempotencyKey = normalizedKey;
        booking.idempotencyFingerprint = fingerprint;
        booking.purpose = request.spaceConfiguration() == null ? null : request.spaceConfiguration().purpose();
        booking.layoutId = request.spaceConfiguration() == null ? null : request.spaceConfiguration().layoutId();
        if (confirmationMode(organizationId, request.bookableType(), request.bookableId()) == BookingConfirmationMode.AUTOMATIC) {
            booking.status = BookingStatus.CONFIRMED;
        }

        try {
            return bookings.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            if (normalizedKey != null) {
                Optional<Booking> prior = bookings.findByOrganizationIdAndIdempotencyKey(organizationId, normalizedKey);
                if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
            }
            throw new ApiException("BOOKING_SLOT_UNAVAILABLE", "The selected time slot is no longer available.", HttpStatus.CONFLICT);
        }
    }

    public Booking findPublic(String reference) {
        return bookings.findByReference(reference)
            .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "Booking not found.", HttpStatus.NOT_FOUND));
    }

    private UUID resolvePublicOrganization(BookingRequest request) {
        if (request.bookableType() == BookableType.CONSULTATION) {
            throw new ApiException("BOOKING_BOOKABLE_TYPE_UNSUPPORTED", "Consultations must be represented by a SERVICE booking.", HttpStatus.BAD_REQUEST);
        }
        if (request.bookableType() == BookableType.SERVICE) {
            return services.findById(request.bookableId())
                .filter(service -> service.active && service.bookingEnabled)
                .map(service -> service.organizationId)
                .orElseThrow(this::bookableInactive);
        }
        if (request.bookableType() == BookableType.SPACE) {
            return spaces.findById(request.bookableId())
                .filter(space -> space.active && space.bookingEnabled)
                .map(space -> space.organizationId)
                .orElseThrow(this::bookableInactive);
        }
        return organizations.findAll().stream()
            .filter(organization -> organization.active)
            .filter(organization -> courseSessions.findByOrganizationIdAndId(organization.id, request.bookableId()).filter(session -> session.active).isPresent())
            .map(organization -> organization.id)
            .findFirst()
            .orElseThrow(this::bookableInactive);
    }

    private ApiException bookableInactive() {
        return new ApiException("BOOKABLE_INACTIVE", "The requested resource is not available for booking.", HttpStatus.CONFLICT);
    }

    private void validateResourceAndBusinessRules(UUID organizationId, BookingRequest request, ZoneId zone) {
        BookableType type = request.bookableType();
        UUID id = request.bookableId();
        if (type == BookableType.CONSULTATION) {
            throw new ApiException("BOOKING_BOOKABLE_TYPE_UNSUPPORTED", "Consultations must be represented by a SERVICE booking.", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime localStart = LocalDateTime.of(request.date(), request.startTime());
        LocalDateTime localEnd = LocalDateTime.of(request.date(), request.endTime());
        if (!localStart.isBefore(localEnd)) {
            throw new ApiException("VALIDATION_FAILED", "The booking end time must be after the start time.", HttpStatus.BAD_REQUEST);
        }

        if (type == BookableType.SERVICE) {
            ServiceEntity service = services.findByOrganizationIdAndId(organizationId, id)
                .filter(value -> value.active && value.bookingEnabled)
                .orElseThrow(() -> new ApiException("BOOKABLE_INACTIVE", "The service is not available for booking.", HttpStatus.CONFLICT));
            if (service.durationMinutes == null || service.durationMinutes <= 0) {
                throw new ApiException("VALIDATION_FAILED", "The service requires a configured duration before it can be scheduled.", HttpStatus.BAD_REQUEST);
            }
            long requestedMinutes = Duration.between(localStart, localEnd).toMinutes();
            if (requestedMinutes != service.durationMinutes) {
                throw new ApiException("VALIDATION_FAILED", "The selected duration does not match the configured service duration.", HttpStatus.BAD_REQUEST);
            }
        }

        if (type == BookableType.SPACE) {
            Space space = spaces.findByOrganizationIdAndId(organizationId, id)
                .filter(value -> value.active && value.bookingEnabled)
                .orElseThrow(() -> new ApiException("BOOKABLE_INACTIVE", "The space is not available for booking.", HttpStatus.CONFLICT));
            if (request.participants() == null || request.participants() < 1) {
                throw new ApiException("VALIDATION_FAILED", "At least one participant is required for a space reservation.", HttpStatus.BAD_REQUEST);
            }
            if (space.capacityMax != null && request.participants() > space.capacityMax) {
                throw new ApiException("VALIDATION_FAILED", "The number of participants exceeds the maximum capacity of the space.", HttpStatus.BAD_REQUEST);
            }
        }

        if (type == BookableType.COURSE_SESSION && courseSessions.findByOrganizationIdAndId(organizationId, id).filter(s -> s.active).isEmpty()) {
            throw new ApiException("BOOKABLE_INACTIVE", "The course session is not available for booking.", HttpStatus.CONFLICT);
        }

        ZonedDateTime.of(request.date(), request.startTime(), zone);
        ZonedDateTime.of(request.date(), request.endTime(), zone);
    }

    private BookingConfirmationMode confirmationMode(UUID organizationId, BookableType type, UUID id) {
        if (type == BookableType.SERVICE) {
            return services.findByOrganizationIdAndId(organizationId, id).map(value -> value.confirmationMode).orElse(BookingConfirmationMode.MANUAL);
        }
        if (type == BookableType.SPACE) {
            return spaces.findByOrganizationIdAndId(organizationId, id).map(value -> value.confirmationMode).orElse(BookingConfirmationMode.MANUAL);
        }
        return BookingConfirmationMode.MANUAL;
    }

    private Customer findOrCreateCustomer(UUID org, CustomerInput input, String source) {
        Customer customer = null;
        if (input.email() != null && !input.email().isBlank()) {
            customer = customers.findFirstByOrganizationIdAndEmailIgnoreCase(org, input.email()).orElse(null);
        }
        if (customer == null && input.phone() != null && !input.phone().isBlank()) {
            customer = customers.findFirstByOrganizationIdAndPhone(org, input.phone()).orElse(null);
        }
        return customer == null ? customers.save(new Customer(org, input.firstName(), input.lastName(), input.email(), input.phone(), source)) : customer;
    }

    private Booking replayOrReject(Booking prior, String fingerprint) {
        if (!Objects.equals(prior.idempotencyFingerprint, fingerprint)) {
            throw new ApiException("IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used with a different request.", HttpStatus.CONFLICT);
        }
        return prior;
    }

    private String normalizeKey(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim();
        if (normalized.length() > 255) {
            throw new ApiException("VALIDATION_FAILED", "Idempotency-Key must be 255 characters or fewer.", HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }

    private String fingerprint(BookingRequest request, ZoneId zone) {
        String value = String.join("|", String.valueOf(request.bookableType()), String.valueOf(request.bookableId()), String.valueOf(request.date()),
            String.valueOf(request.startTime()), String.valueOf(request.endTime()), String.valueOf(request.participants()),
            String.valueOf(request.customer()), String.valueOf(request.spaceConfiguration()), String.valueOf(request.notes()), zone.getId());
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required", ex);
        }
    }

    private String reference() {
        return "CST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    public record BookingRequest(@NotNull BookableType bookableType, @NotNull UUID bookableId, @NotNull LocalDate date,
                                 @NotNull LocalTime startTime, @NotNull LocalTime endTime, Integer participants,
                                 @Valid @NotNull CustomerInput customer, SpaceConfiguration spaceConfiguration, String notes) { }
    public record CustomerInput(@NotBlank String firstName, String lastName, String email, String phone) { }
    public record SpaceConfiguration(UUID layoutId, String purpose, List<UUID> amenityIds) { }
}
