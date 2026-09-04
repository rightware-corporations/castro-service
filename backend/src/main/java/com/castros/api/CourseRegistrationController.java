package com.castros.api;

import com.castros.catalog.CourseRegistration;
import com.castros.catalog.CourseRegistrationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/course-sessions")
public class CourseRegistrationController {
    private final CourseRegistrationService registrations;

    public CourseRegistrationController(CourseRegistrationService registrations) {
        this.registrations = registrations;
    }

    @PostMapping("/{sessionId}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse register(@PathVariable UUID sessionId,
                                         @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                         @Valid @RequestBody RegistrationRequest input) {
        CourseRegistration registration = registrations.register(sessionId,
            new CourseRegistrationService.RegistrationInput(input.firstName(), input.lastName(), input.email(), input.phone(),
                input.participantCount(), input.organizationName(), input.notes()), idempotencyKey);
        return response(registration);
    }

    private RegistrationResponse response(CourseRegistration registration) {
        return new RegistrationResponse(registration.id, registration.reference, registration.status.name(),
            registration.courseSessionId, registration.participantCount, registration.createdAt);
    }

    public record RegistrationRequest(@NotBlank String firstName, String lastName, @Email @NotBlank String email,
                                      String phone, @Min(1) int participantCount, String organizationName, String notes) { }
    public record RegistrationResponse(UUID id, String reference, String status, UUID courseSessionId,
                                       int participantCount, OffsetDateTime createdAt) { }
}
