package com.castros.catalog;

import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/catalog/services")
public class ServiceAdminController {
    private final ServiceRepository services;

    public ServiceAdminController(ServiceRepository services) {
        this.services = services;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('service.read')")
    public List<ServiceResponse> list(Authentication authentication) {
        return services.findAllByOrganizationIdOrderBySortOrderAscNameAsc(organizationId(authentication))
            .stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('service.manage')")
    public ServiceResponse create(@Valid @RequestBody ServiceInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        String slug = normalizeSlug(input.slug());
        ensureSlugAvailable(organizationId, slug, null);
        ServiceEntity service = new ServiceEntity();
        apply(service, input, organizationId, slug);
        return toResponse(services.save(service));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('service.manage')")
    public ServiceResponse update(@PathVariable UUID id, @Valid @RequestBody ServiceInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        ServiceEntity service = services.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        String slug = normalizeSlug(input.slug());
        ensureSlugAvailable(organizationId, slug, id);
        apply(service, input, organizationId, slug);
        return toResponse(services.save(service));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('service.manage')")
    public void deactivate(@PathVariable UUID id, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        ServiceEntity service = services.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        service.active = false;
        services.save(service);
    }

    private void ensureSlugAvailable(UUID organizationId, String slug, UUID currentId) {
        services.findByOrganizationIdAndSlug(organizationId, slug).ifPresent(existing -> {
            if (currentId == null || !existing.id.equals(currentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Service slug already exists");
            }
        });
    }

    private void apply(ServiceEntity service, ServiceInput input, UUID organizationId, String slug) {
        service.organizationId = organizationId;
        service.name = input.name().trim();
        service.slug = slug;
        service.shortDescription = clean(input.shortDescription());
        service.description = clean(input.description());
        service.durationMinutes = input.durationMinutes();
        service.bookingEnabled = input.bookingEnabled();
        service.active = input.active();
        service.featured = input.featured();
        service.sortOrder = input.sortOrder();
    }

    private ServiceResponse toResponse(ServiceEntity service) {
        return new ServiceResponse(service.id, service.name, service.slug, service.shortDescription, service.description,
            service.durationMinutes, service.bookingEnabled, service.active, service.featured, service.sortOrder, service.createdAt);
    }

    private static String clean(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isBlank() ? null : cleaned;
    }

    private static String normalizeSlug(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private static UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context unavailable");
        }
        return user.organizationId;
    }

    public record ServiceInput(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*") String slug,
        String shortDescription,
        String description,
        @Min(1) Integer durationMinutes,
        boolean bookingEnabled,
        boolean active,
        boolean featured,
        @Min(0) int sortOrder
    ) {}

    public record ServiceResponse(
        UUID id,
        String name,
        String slug,
        String shortDescription,
        String description,
        Integer durationMinutes,
        boolean bookingEnabled,
        boolean active,
        boolean featured,
        int sortOrder,
        java.time.OffsetDateTime createdAt
    ) {}
}
