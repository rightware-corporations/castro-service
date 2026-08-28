package com.castros.booking;

import com.castros.availability.AvailabilityService;
import com.castros.catalog.CourseSessionRepository;
import com.castros.catalog.CourseSession;
import com.castros.catalog.ServiceEntity;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.SpaceRepository;
import com.castros.catalog.Space;
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
        this.bookings = bookings; this.customers = customers; this.organizations = organizations;
        this.services = services; this.spaces = spaces; this.courseSessions = courseSessions; this.availability = availability;
    }

    @Transactional
    public Booking create(BookingRequest request, ZoneId zone, String idempotencyKey) {
        UUID org = organizations.findAll().stream().filter(o -> o.active).findFirst().map(o -> o.id)
                .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "No active organization is configured.", HttpStatus.NOT_FOUND));
        String normalizedKey = normalizeKey(idempotencyKey);
        String fingerprint = fingerprint(request, zone);
        if (normalizedKey != null) {
            Optional<Booking> prior = bookings.findByOrganizationIdAndIdempotencyKey(org, normalizedKey);
            if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
        }
        validateResource(request.bookableType(), request.bookableId());
        OffsetDateTime start = ZonedDateTime.of(request.date(), request.startTime(), zone).toOffsetDateTime();
        OffsetDateTime end = ZonedDateTime.of(request.date(), request.endTime(), zone).toOffsetDateTime();
        availability.assertAvailable(request.bookableType(), request.bookableId(), start, end);
        Customer customer = findOrCreateCustomer(org, request.customer());
        Booking booking = new Booking(org, customer.id, request.bookableType(), request.bookableId(), start, end, reference());
        booking.notes = request.notes(); booking.participants = request.participants(); booking.idempotencyKey = normalizedKey; booking.idempotencyFingerprint = fingerprint;
        booking.purpose = request.spaceConfiguration() == null ? null : request.spaceConfiguration().purpose();
        booking.layoutId = request.spaceConfiguration() == null ? null : request.spaceConfiguration().layoutId();
        try {
            return bookings.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            if (normalizedKey != null) {
                Optional<Booking> prior = bookings.findByOrganizationIdAndIdempotencyKey(org, normalizedKey);
                if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
            }
            throw new ApiException("BOOKING_SLOT_UNAVAILABLE", "The selected time slot is no longer available.", HttpStatus.CONFLICT);
        }
    }

    public Booking findPublic(String reference) {
        return bookings.findByReference(reference).orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "Booking not found.", HttpStatus.NOT_FOUND));
    }

    private void validateResource(BookableType type, UUID id) {
        if (type == BookableType.CONSULTATION) {
            throw new ApiException("BOOKING_BOOKABLE_TYPE_UNSUPPORTED", "Consultations must be represented by a SERVICE booking.", HttpStatus.BAD_REQUEST);
        }
        if (type == BookableType.SERVICE && services.findById(id).filter(s -> s.active && s.bookingEnabled).isEmpty()) {
            throw new ApiException("BOOKABLE_INACTIVE", "The service is not available for booking.", HttpStatus.CONFLICT);
        }
        if (type == BookableType.SPACE && spaces.findById(id).filter(s -> s.active).isEmpty()) {
            throw new ApiException("BOOKABLE_INACTIVE", "The space is not available for booking.", HttpStatus.CONFLICT);
        }
        if (type == BookableType.COURSE_SESSION && courseSessions.findById(id).filter(s -> s.active).isEmpty()) {
            throw new ApiException("BOOKABLE_INACTIVE", "The course session is not available for booking.", HttpStatus.CONFLICT);
        }
    }

    private Customer findOrCreateCustomer(UUID org, CustomerInput input) {
        Customer customer = null;
        if (input.email() != null && !input.email().isBlank()) customer = customers.findFirstByOrganizationIdAndEmailIgnoreCase(org, input.email()).orElse(null);
        if (customer == null && input.phone() != null && !input.phone().isBlank()) customer = customers.findFirstByOrganizationIdAndPhone(org, input.phone()).orElse(null);
        return customer == null ? customers.save(new Customer(org, input.firstName(), input.lastName(), input.email(), input.phone(), "PUBLIC_BOOKING")) : customer;
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
        if (normalized.length() > 255) throw new ApiException("VALIDATION_FAILED", "Idempotency-Key must be 255 characters or fewer.", HttpStatus.BAD_REQUEST);
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

    private String reference() { return "CST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT); }

    public record BookingRequest(@NotNull BookableType bookableType, @NotNull UUID bookableId, @NotNull LocalDate date,
                                 @NotNull LocalTime startTime, @NotNull LocalTime endTime, Integer participants,
                                 @Valid @NotNull CustomerInput customer, SpaceConfiguration spaceConfiguration, String notes) { }
    public record CustomerInput(@NotBlank String firstName, String lastName, String email, String phone) { }
    public record SpaceConfiguration(UUID layoutId, String purpose, List<UUID> amenityIds) { }
}
