package com.castros.catalog;

import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.notification.NotificationPublisher;
import com.castros.shared.exception.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseRegistrationService {
    private final CourseSessionRepository sessions;
    private final CourseRepository courses;
    private final CourseRegistrationRepository registrations;
    private final CustomerRepository customers;
    private final NotificationPublisher notifications;

    public CourseRegistrationService(CourseSessionRepository sessions, CourseRepository courses,
                                     CourseRegistrationRepository registrations, CustomerRepository customers,
                                     NotificationPublisher notifications) {
        this.sessions = sessions;
        this.courses = courses;
        this.registrations = registrations;
        this.customers = customers;
        this.notifications = notifications;
    }

    @Transactional
    public CourseRegistration register(UUID sessionId, RegistrationInput input, String idempotencyKey) {
        CourseSession session = sessions.findById(sessionId)
            .filter(value -> value.active)
            .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "Course session not found.", HttpStatus.NOT_FOUND));
        Course course = courses.findById(session.courseId)
            .filter(value -> value.active)
            .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "Course is not available.", HttpStatus.NOT_FOUND));
        if (!session.startAt.isAfter(OffsetDateTime.now())) {
            throw new ApiException("VALIDATION_FAILED", "Registration is closed for a session that has already started.", HttpStatus.CONFLICT);
        }
        if (input.participantCount() < 1) {
            throw new ApiException("VALIDATION_FAILED", "At least one participant is required.", HttpStatus.BAD_REQUEST);
        }

        String key = normalizeKey(idempotencyKey);
        String fingerprint = fingerprint(sessionId, input);
        if (key != null) {
            Optional<CourseRegistration> prior = registrations.findByOrganizationIdAndIdempotencyKey(course.organizationId, key);
            if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
        }

        Customer customer = customers.findFirstByOrganizationIdAndEmailIgnoreCase(course.organizationId, input.email()).orElse(null);
        if (customer == null && input.phone() != null && !input.phone().isBlank()) {
            customer = customers.findFirstByOrganizationIdAndPhone(course.organizationId, input.phone().trim()).orElse(null);
        }
        if (customer == null) {
            customer = customers.save(new Customer(course.organizationId, input.firstName().trim(), clean(input.lastName()),
                input.email().trim(), clean(input.phone()), "PUBLIC_COURSE_REGISTRATION"));
        }

        CourseRegistration registration = new CourseRegistration(course.organizationId, course.id, session.id,
            customer.id, reference(), input.participantCount());
        registration.organizationName = clean(input.organizationName());
        registration.notes = clean(input.notes());
        registration.idempotencyKey = key;
        registration.idempotencyFingerprint = fingerprint;

        try {
            CourseRegistration saved = registrations.saveAndFlush(registration);
            notifications.publishToOperations(course.organizationId, "COURSE_REGISTRATION_CREATED",
                "Nova inscrição em formação",
                input.firstName().trim() + " registou " + input.participantCount() + " participante(s) em " + course.name + ".",
                "COURSE_REGISTRATION", saved.id);
            return saved;
        } catch (DataIntegrityViolationException exception) {
            if (key != null) {
                Optional<CourseRegistration> prior = registrations.findByOrganizationIdAndIdempotencyKey(course.organizationId, key);
                if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
            }
            throw new ApiException("DUPLICATE_RESOURCE", "The registration conflicts with existing data.", HttpStatus.CONFLICT);
        }
    }

    private CourseRegistration replayOrReject(CourseRegistration prior, String fingerprint) {
        if (!Objects.equals(prior.idempotencyFingerprint, fingerprint)) {
            throw new ApiException("IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used with different registration data.", HttpStatus.CONFLICT);
        }
        return prior;
    }

    private String normalizeKey(String value) {
        if (value == null || value.isBlank()) return null;
        String key = value.trim();
        if (key.length() > 255) throw new ApiException("VALIDATION_FAILED", "Idempotency-Key must be 255 characters or fewer.", HttpStatus.BAD_REQUEST);
        return key;
    }

    private String fingerprint(UUID sessionId, RegistrationInput input) {
        String value = String.join("|", sessionId.toString(), input.firstName().trim(), String.valueOf(clean(input.lastName())),
            input.email().trim().toLowerCase(Locale.ROOT), String.valueOf(clean(input.phone())), String.valueOf(input.participantCount()),
            String.valueOf(clean(input.organizationName())), String.valueOf(clean(input.notes())));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required", exception);
        }
    }

    private String reference() {
        return "TRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record RegistrationInput(String firstName, String lastName, String email, String phone,
                                    int participantCount, String organizationName, String notes) { }
}
