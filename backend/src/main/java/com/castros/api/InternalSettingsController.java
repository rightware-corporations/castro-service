package com.castros.api;

import com.castros.organization.Organization;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.config.AppProperties;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/settings")
public class InternalSettingsController {
    private final OrganizationRepository organizations;
    private final AppProperties properties;

    public InternalSettingsController(OrganizationRepository organizations, AppProperties properties) {
        this.organizations = organizations;
        this.properties = properties;
    }

    @GetMapping("/general")
    @PreAuthorize("hasAuthority('settings.read')")
    public GeneralSettingsResponse getGeneral(Authentication authentication) {
        Organization organization = organization(authentication);
        return response(organization);
    }

    @PutMapping("/general")
    @PreAuthorize("hasAuthority('settings.manage')")
    @Transactional
    public GeneralSettingsResponse updateGeneral(@Valid @RequestBody GeneralSettingsInput input, Authentication authentication) {
        Organization organization = organization(authentication);
        String timezone = input.businessTimezone().trim();
        try { ZoneId.of(timezone); }
        catch (DateTimeException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid business timezone"); }
        organization.name = input.organizationName().trim();
        organization.businessTimezone = timezone;
        return response(organizations.save(organization));
    }

    private GeneralSettingsResponse response(Organization organization) {
        String timezone = organization.businessTimezone == null || organization.businessTimezone.isBlank()
            ? properties.getBusinessTimezone()
            : organization.businessTimezone;
        return new GeneralSettingsResponse(organization.id, organization.name, organization.slug, timezone);
    }

    private Organization organization(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context required");
        UUID id = user.organizationId;
        return organizations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public record GeneralSettingsResponse(UUID organizationId, String organizationName, String organizationSlug, String businessTimezone) { }
    public record GeneralSettingsInput(@NotBlank @Size(max=160) String organizationName, @NotBlank @Size(max=80) String businessTimezone) { }
}
