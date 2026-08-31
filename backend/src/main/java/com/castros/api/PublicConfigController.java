package com.castros.api;

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
        String timezone = organizations.findFirstByActiveTrueOrderByCreatedAtAsc()
            .map(organization -> organization.businessTimezone)
            .filter(value -> value != null && !value.isBlank())
            .orElse(properties.getBusinessTimezone());
        return new PublicConfigResponse(timezone);
    }
}
