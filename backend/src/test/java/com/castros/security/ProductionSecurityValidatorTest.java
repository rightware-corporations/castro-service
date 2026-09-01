package com.castros.security;

import com.castros.shared.config.AppProperties;
import com.castros.shared.security.ProductionSecurityValidator;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductionSecurityValidatorTest {

    @Test
    void rejectsInvalidRateLimitsEvenOutsideProduction() {
        AppProperties properties = new AppProperties();
        properties.setLoginRateLimitPerMinute(0);

        ProductionSecurityValidator validator = new ProductionSecurityValidator(properties, new MockEnvironment());

        assertThrows(IllegalStateException.class, validator::afterSingletonsInstantiated);
    }

    @Test
    void rejectsInsecureProductionCookie() {
        AppProperties properties = productionProperties();
        MockEnvironment environment = secureProductionEnvironment()
            .withProperty("server.servlet.session.cookie.secure", "false");

        ProductionSecurityValidator validator = new ProductionSecurityValidator(properties, environment);

        assertThrows(IllegalStateException.class, validator::afterSingletonsInstantiated);
    }

    @Test
    void rejectsWildcardOrNonHttpsProductionOrigins() {
        AppProperties wildcard = productionProperties();
        wildcard.setAllowedOrigins(new String[]{"*"});
        assertThrows(IllegalStateException.class,
            () -> new ProductionSecurityValidator(wildcard, secureProductionEnvironment()).afterSingletonsInstantiated());

        AppProperties http = productionProperties();
        http.setAllowedOrigins(new String[]{"http://castros.example"});
        assertThrows(IllegalStateException.class,
            () -> new ProductionSecurityValidator(http, secureProductionEnvironment()).afterSingletonsInstantiated());
    }

    @Test
    void acceptsHardenedProductionConfiguration() {
        AppProperties properties = productionProperties();
        ProductionSecurityValidator validator = new ProductionSecurityValidator(properties, secureProductionEnvironment());

        assertDoesNotThrow(validator::afterSingletonsInstantiated);
    }

    private AppProperties productionProperties() {
        AppProperties properties = new AppProperties();
        properties.setProductionMode(true);
        properties.setAllowedOrigins(new String[]{"https://castros.example"});
        properties.setAvailabilityDevelopmentFallback(false);
        properties.setLoginRateLimitPerMinute(10);
        properties.setPublicMutationRateLimitPerMinute(30);
        return properties;
    }

    private MockEnvironment secureProductionEnvironment() {
        return new MockEnvironment()
            .withProperty("server.servlet.session.cookie.secure", "true")
            .withProperty("springdoc.api-docs.enabled", "false")
            .withProperty("springdoc.swagger-ui.enabled", "false")
            .withProperty("spring.datasource.password", "non-default-secret");
    }
}
