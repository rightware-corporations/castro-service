package com.castros.shared.security;

import com.castros.shared.config.AppProperties;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Arrays;

@Component
public class ProductionSecurityValidator implements SmartInitializingSingleton {
    private final AppProperties properties;
    private final Environment environment;

    public ProductionSecurityValidator(AppProperties properties, Environment environment) {
        this.properties = properties;
        this.environment = environment;
    }

    @Override
    public void afterSingletonsInstantiated() {
        validateRateLimits();
        if (!properties.isProductionMode()) return;

        String[] origins = Arrays.stream(properties.getAllowedOrigins()).map(String::trim).filter(value -> !value.isBlank()).toArray(String[]::new);
        if (origins.length == 0) throw unsafe("ALLOWED_ORIGINS must be configured");
        for (String origin : origins) {
            if ("*".equals(origin)) throw unsafe("wildcard CORS origins are forbidden");
            URI uri;
            try { uri = URI.create(origin); } catch (RuntimeException exception) { throw unsafe("invalid CORS origin: " + origin); }
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null) throw unsafe("production CORS origins must use HTTPS");
            String host = uri.getHost().toLowerCase();
            if ("localhost".equals(host) || host.startsWith("127.") || "::1".equals(host)) throw unsafe("localhost CORS origins are forbidden in production");
        }

        if (!Boolean.parseBoolean(environment.getProperty("server.servlet.session.cookie.secure", "false"))) throw unsafe("SESSION_COOKIE_SECURE must be true");
        if (Boolean.parseBoolean(environment.getProperty("springdoc.api-docs.enabled", "true")) || Boolean.parseBoolean(environment.getProperty("springdoc.swagger-ui.enabled", "true"))) throw unsafe("SpringDoc/Swagger must be disabled");
        if (properties.isAvailabilityDevelopmentFallback()) throw unsafe("availability development fallback must be disabled");

        String databasePassword = environment.getProperty("spring.datasource.password", "");
        if (databasePassword.isBlank() || "castros".equals(databasePassword)) throw unsafe("default database credentials are forbidden");
    }

    private void validateRateLimits() {
        if (properties.getLoginRateLimitPerMinute() <= 0) throw unsafe("login rate limit must be greater than zero");
        if (properties.getPublicMutationRateLimitPerMinute() <= 0) throw unsafe("public mutation rate limit must be greater than zero");
    }

    private IllegalStateException unsafe(String reason) {
        return new IllegalStateException("Unsafe security configuration: " + reason);
    }
}
