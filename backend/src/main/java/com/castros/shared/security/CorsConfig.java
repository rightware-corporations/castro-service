package com.castros.shared.security;

import com.castros.shared.config.AppProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties properties) {
        List<String> tenantOrigins = normalizedOrigins(properties.getAllowedOrigins());
        List<String> platformOrigins = normalizedOrigins(properties.getPlatformAllowedOrigins());
        if (platformOrigins.isEmpty() && !properties.isProductionMode()) platformOrigins = tenantOrigins;

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/platform/**", configuration(platformOrigins));
        source.registerCorsConfiguration("/**", configuration(tenantOrigins));
        return source;
    }

    private List<String> normalizedOrigins(String[] configured) {
        return Arrays.stream(configured == null ? new String[0] : configured)
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .peek(value -> {
                if ("*".equals(value)) throw new IllegalStateException("Wildcard CORS origin is forbidden when credentials are enabled");
            })
            .distinct()
            .toList();
    }

    private CorsConfiguration configuration(List<String> origins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization", "X-Requested-With", "X-CSRF-TOKEN", "X-XSRF-TOKEN", "Idempotency-Key"));
        configuration.setExposedHeaders(List.of("Retry-After"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        return configuration;
    }
}
