package com.castros.api;

import com.castros.shared.config.AppProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/config")
public class PublicConfigController {
    private final AppProperties properties;
    public PublicConfigController(AppProperties properties) { this.properties = properties; }
    @GetMapping
    public Map<String, String> config() { return Map.of("businessTimezone", properties.getBusinessTimezone()); }
}
