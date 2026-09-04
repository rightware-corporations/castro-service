package com.castros.api;

import com.castros.catalog.*;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PublicCatalogController {
    private final ServiceRepository services;
    private final CourseRepository courses;
    private final CourseSessionRepository sessions;
    private final SpaceRepository spaces;

    public PublicCatalogController(ServiceRepository services, CourseRepository courses, CourseSessionRepository sessions, SpaceRepository spaces) {
        this.services = services;
        this.courses = courses;
        this.sessions = sessions;
        this.spaces = spaces;
    }

    @GetMapping("/services")
    @Operation(summary = "List active services")
    public List<CatalogItem> services() {
        return services.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(s -> new CatalogItem(s.id, s.name, s.slug, s.description, s.durationMinutes, s.bookingEnabled, s.confirmationMode))
            .toList();
    }

    @GetMapping("/services/{slug}")
    public CatalogItem service(@PathVariable String slug) {
        var s = services.findBySlugAndActiveTrue(slug).orElseThrow();
        return new CatalogItem(s.id, s.name, s.slug, s.description, s.durationMinutes, s.bookingEnabled, s.confirmationMode);
    }

    @GetMapping("/courses")
    public List<CourseItem> courses() {
        return courses.findByActiveTrueOrderByNameAsc().stream().map(this::toCourseItem).toList();
    }

    @GetMapping("/courses/{slug}")
    public CourseItem course(@PathVariable String slug) {
        return toCourseItem(courses.findBySlugAndActiveTrue(slug).orElseThrow());
    }

    @GetMapping("/courses/{id}/sessions")
    public List<CourseSessionResponse> sessions(@PathVariable UUID id) {
        return sessions.findByCourseIdAndActiveTrueOrderByStartAtAsc(id).stream()
            .map(s -> new CourseSessionResponse(s.id, s.startAt, s.endAt, s.label))
            .toList();
    }

    @GetMapping("/spaces")
    public List<SpaceItem> spaces() {
        return spaces.findByActiveTrueOrderByNameAsc().stream()
            .map(s -> new SpaceItem(s.id, s.name, s.slug, s.description, s.location, s.capacityMin, s.capacityMax, s.bookingEnabled, s.confirmationMode))
            .toList();
    }

    @GetMapping("/spaces/{slug}")
    public SpaceItem space(@PathVariable String slug) {
        var s = spaces.findBySlugAndActiveTrue(slug).orElseThrow();
        return new SpaceItem(s.id, s.name, s.slug, s.description, s.location, s.capacityMin, s.capacityMax, s.bookingEnabled, s.confirmationMode);
    }

    private CourseItem toCourseItem(Course course) {
        List<String> outcomes = course.learningOutcomes == null || course.learningOutcomes.isBlank()
            ? List.of()
            : Arrays.stream(course.learningOutcomes.split("\\R"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
        return new CourseItem(
            course.id, course.name, course.slug, course.shortDescription, course.description,
            course.modality, course.durationLabel, course.scheduleSummary, course.investmentAmount,
            course.investmentCurrency, course.certificateIncluded, course.contactPhone, outcomes, course.featured);
    }
}
