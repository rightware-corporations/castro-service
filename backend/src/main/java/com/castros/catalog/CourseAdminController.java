package com.castros.catalog;

import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/catalog/courses")
public class CourseAdminController {
    private final CourseRepository courses;
    private final CourseSessionRepository sessions;

    public CourseAdminController(CourseRepository courses, CourseSessionRepository sessions) {
        this.courses = courses;
        this.sessions = sessions;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('course.read')")
    public List<CourseResponse> list(Authentication authentication) {
        return courses.findAllByOrganizationIdOrderByNameAsc(organizationId(authentication)).stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('course.manage')")
    public CourseResponse create(@Valid @RequestBody CourseInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        String slug = normalizeSlug(input.slug());
        ensureSlugAvailable(organizationId, slug, null);
        Course course = new Course();
        apply(course, input, organizationId, slug);
        return toResponse(courses.save(course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('course.manage')")
    public CourseResponse update(@PathVariable UUID id, @Valid @RequestBody CourseInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Course course = courses.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        String slug = normalizeSlug(input.slug());
        ensureSlugAvailable(organizationId, slug, id);
        apply(course, input, organizationId, slug);
        return toResponse(courses.save(course));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('course.manage')")
    public void deactivate(@PathVariable UUID id, Authentication authentication) {
        Course course = courses.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        course.active = false;
        courses.save(course);
    }

    @GetMapping("/{courseId}/sessions")
    @PreAuthorize("hasAuthority('course.read')")
    public List<SessionResponse> listSessions(@PathVariable UUID courseId, Authentication authentication) {
        requireCourse(courseId, authentication);
        return sessions.findAllByCourseIdOrderByStartAtAsc(courseId).stream().map(this::toSession).toList();
    }

    @PostMapping("/{courseId}/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('course.manage')")
    public SessionResponse createSession(@PathVariable UUID courseId, @Valid @RequestBody SessionInput input, Authentication authentication) {
        requireCourse(courseId, authentication);
        validateSessionWindow(input.startAt(), input.endAt());
        CourseSession session = new CourseSession();
        apply(session, courseId, input);
        return toSession(sessions.save(session));
    }

    @PutMapping("/{courseId}/sessions/{id}")
    @PreAuthorize("hasAuthority('course.manage')")
    public SessionResponse updateSession(@PathVariable UUID courseId, @PathVariable UUID id, @Valid @RequestBody SessionInput input, Authentication authentication) {
        requireCourse(courseId, authentication);
        validateSessionWindow(input.startAt(), input.endAt());
        CourseSession session = sessions.findByCourseIdAndId(courseId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course session not found"));
        apply(session, courseId, input);
        return toSession(sessions.save(session));
    }

    @DeleteMapping("/{courseId}/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('course.manage')")
    public void deactivateSession(@PathVariable UUID courseId, @PathVariable UUID id, Authentication authentication) {
        requireCourse(courseId, authentication);
        CourseSession session = sessions.findByCourseIdAndId(courseId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course session not found"));
        session.active = false;
        sessions.save(session);
    }

    private Course requireCourse(UUID courseId, Authentication authentication) {
        return courses.findByOrganizationIdAndId(organizationId(authentication), courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    private void ensureSlugAvailable(UUID organizationId, String slug, UUID currentId) {
        courses.findByOrganizationIdAndSlug(organizationId, slug).ifPresent(existing -> {
            if (currentId == null || !existing.id.equals(currentId)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Course slug already exists");
        });
    }

    private void apply(Course course, CourseInput input, UUID organizationId, String slug) {
        course.organizationId = organizationId;
        course.name = input.name().trim();
        course.slug = slug;
        course.description = clean(input.description());
        course.active = input.active();
    }

    private void apply(CourseSession session, UUID courseId, SessionInput input) {
        session.courseId = courseId;
        session.startAt = input.startAt();
        session.endAt = input.endAt();
        session.active = input.active();
    }

    private CourseResponse toResponse(Course course) { return new CourseResponse(course.id, course.name, course.slug, course.description, course.active); }
    private SessionResponse toSession(CourseSession session) { return new SessionResponse(session.id, session.courseId, session.startAt, session.endAt, session.active); }

    private static void validateSessionWindow(OffsetDateTime startAt, OffsetDateTime endAt) {
        if (!startAt.isBefore(endAt)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session start must be before end");
    }
    private static String clean(String value) { if (value == null) return null; String cleaned = value.trim(); return cleaned.isBlank() ? null : cleaned; }
    private static String normalizeSlug(String value) { return value.trim().toLowerCase(Locale.ROOT); }
    private static UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context unavailable");
        }
        return user.organizationId;
    }

    public record CourseInput(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*") String slug,
        String description,
        boolean active
    ) {}

    public record CourseResponse(UUID id, String name, String slug, String description, boolean active) {}

    public record SessionInput(@NotNull OffsetDateTime startAt, @NotNull OffsetDateTime endAt, boolean active) {}
    public record SessionResponse(UUID id, UUID courseId, OffsetDateTime startAt, OffsetDateTime endAt, boolean active) {}
}
