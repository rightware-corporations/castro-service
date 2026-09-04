package com.castros.api;

import com.castros.catalog.*;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/course-registrations")
public class InternalCourseRegistrationController {
    private final CourseRegistrationRepository registrations;
    private final CourseRepository courses;
    private final CourseSessionRepository sessions;
    private final CustomerRepository customers;

    public InternalCourseRegistrationController(CourseRegistrationRepository registrations, CourseRepository courses,
                                                CourseSessionRepository sessions, CustomerRepository customers) {
        this.registrations = registrations;
        this.courses = courses;
        this.sessions = sessions;
        this.customers = customers;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('course.read')")
    public List<RegistrationItem> list(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        return registrations.findAllByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
            .map(this::response).toList();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('course.manage')")
    @Transactional
    public RegistrationItem updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusInput input,
                                         Authentication authentication) {
        CourseRegistration registration = registrations.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course registration not found"));
        CourseRegistrationStatus target = input.status();
        if (registration.status == CourseRegistrationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cancelled registrations are final");
        }
        if (target == CourseRegistrationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A registration cannot return to pending");
        }
        registration.status = target;
        registration.updatedAt = OffsetDateTime.now();
        return response(registrations.save(registration));
    }

    private RegistrationItem response(CourseRegistration registration) {
        Course course = courses.findById(registration.courseId).orElse(null);
        CourseSession session = sessions.findById(registration.courseSessionId).orElse(null);
        Customer customer = customers.findById(registration.customerId).orElse(null);
        return new RegistrationItem(registration.id, registration.reference, registration.status,
            registration.courseSessionId, registration.participantCount, registration.createdAt,
            registration.courseId, course == null ? null : course.name,
            session == null ? null : session.startAt, session == null ? null : session.endAt,
            customer == null ? null : customer.firstName, customer == null ? null : customer.lastName,
            customer == null ? null : customer.email, customer == null ? null : customer.phone,
            registration.organizationName, registration.notes);
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context required");
        }
        return user.organizationId;
    }

    public record StatusInput(@NotNull CourseRegistrationStatus status) { }
    public record RegistrationItem(UUID id, String reference, CourseRegistrationStatus status, UUID courseSessionId,
                                   int participantCount, OffsetDateTime createdAt, UUID courseId, String courseName,
                                   OffsetDateTime sessionStartAt, OffsetDateTime sessionEndAt,
                                   String firstName, String lastName, String email, String phone,
                                   String organizationName, String notes) { }
}
