package com.castros.api;

import com.castros.organization.Organization;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.config.AppProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/config")
public class PublicConfigController {
    private final AppProperties properties;
    private final OrganizationRepository organizations;

    public PublicConfigController(AppProperties properties, OrganizationRepository organizations) {
        this.properties = properties;
        this.organizations = organizations;
    }

    @GetMapping
    public PublicConfigResponse config() {
        Organization organization = organizations.findFirstByActiveTrueOrderByCreatedAtAsc().orElse(null);
        String timezone = organization != null && organization.businessTimezone != null && !organization.businessTimezone.isBlank()
            ? organization.businessTimezone
            : properties.getBusinessTimezone();
        return new PublicConfigResponse(timezone,
            organization == null ? null : organization.contactPhone,
            organization == null ? null : organization.whatsappNumber,
            organization == null ? null : organization.contactEmail);
    }
}
