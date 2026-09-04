package com.castros;

import com.castros.platform.PlatformPrincipal;
import com.castros.user.UserAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class TrustBoundaryIntegrationTest {
    @Autowired WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void tenantPrincipalCannotEnterPlatformApiEvenIfPlatformAuthorityIsInjected() throws Exception {
        UserAccount tenant = tenant("tenant-platform-boundary");
        tenant.withPermissionCodes(Set.of("platform.admin"));

        mvc.perform(get("/api/v1/platform/overview").with(authentication(
                new UsernamePasswordAuthenticationToken(tenant, "n/a", tenant.getAuthorities()))))
            .andExpect(status().isForbidden());
    }

    @Test
    void platformPrincipalCannotEnterTenantApiEvenIfTenantAuthorityIsInjected() throws Exception {
        PlatformPrincipal platform = platform("platform-tenant-boundary");

        mvc.perform(get("/api/v1/operations/summary").with(authentication(
                new UsernamePasswordAuthenticationToken(platform, "n/a", List.of(new SimpleGrantedAuthority("tenant.user"))))))
            .andExpect(status().isForbidden());
    }

    @Test
    void platformPrincipalCannotUseTenantSessionIntrospection() throws Exception {
        mvc.perform(get("/api/v1/auth/me").with(asPlatform("platform-tenant-me")))
            .andExpect(status().isForbidden());
    }

    @Test
    void tenantPrincipalCannotUsePlatformSessionIntrospection() throws Exception {
        UserAccount tenant = tenant("tenant-platform-me");
        tenant.withPermissionCodes(Set.of("platform.admin"));

        mvc.perform(get("/api/v1/platform/auth/me").with(authentication(
                new UsernamePasswordAuthenticationToken(tenant, "n/a", tenant.getAuthorities()))))
            .andExpect(status().isForbidden());
    }

    @Test
    void platformSessionHasDedicatedIntrospectionEndpoint() throws Exception {
        mvc.perform(get("/api/v1/platform/auth/me").with(asPlatform("platform-me")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.organizationId").doesNotExist())
            .andExpect(jsonPath("$.experienceType").doesNotExist())
            .andExpect(jsonPath("$.permissions[0]").value("platform.admin"));
    }

    private UserAccount tenant(String prefix) {
        UUID organizationId = UUID.randomUUID();
        UserAccount user = new UserAccount(organizationId, prefix + "@example.test", "unused", "Tenant", "User");
        user.id = UUID.randomUUID();
        return user;
    }

    private PlatformPrincipal platform(String prefix) {
        return new PlatformPrincipal(UUID.randomUUID(), prefix + "@rightware.test", "RIGHTWARE", "Admin");
    }

    private RequestPostProcessor asPlatform(String prefix) {
        return authentication(new UsernamePasswordAuthenticationToken(
            platform(prefix), "n/a", List.of(new SimpleGrantedAuthority("platform.admin"))));
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
