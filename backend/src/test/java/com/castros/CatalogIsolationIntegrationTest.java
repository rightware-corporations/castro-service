package com.castros;

import com.castros.user.UserAccount;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class CatalogIsolationIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext context;
    private MockMvc mvc;

    @BeforeEach void setup() { mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build(); }

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    void catalogListsAndMutationsAreOrganizationScoped() throws Exception {
        UUID orgA = seedOrganization("catalog-a");
        UUID orgB = seedOrganization("catalog-b");
        UserAccount actor = seedUser(orgA);
        UUID serviceA = seedService(orgA, "service-a");
        UUID serviceB = seedService(orgB, "service-b");
        UUID courseA = seedCourse(orgA, "course-a");
        UUID courseB = seedCourse(orgB, "course-b");
        UUID spaceA = seedSpace(orgA, "space-a");
        UUID spaceB = seedSpace(orgB, "space-b");
        seedCourseSession(courseA);
        seedCourseSession(courseB);

        mvc.perform(get("/api/v1/operations/catalog/services").with(as(actor, "service.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(serviceA.toString()));
        mvc.perform(get("/api/v1/operations/catalog/courses").with(as(actor, "course.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(courseA.toString()));
        mvc.perform(get("/api/v1/operations/catalog/spaces").with(as(actor, "space.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(spaceA.toString()));

        mvc.perform(get("/api/v1/operations/catalog/courses/{id}/sessions", courseB).with(as(actor, "course.read")))
            .andExpect(status().isNotFound());

        mvc.perform(put("/api/v1/operations/catalog/services/{id}", serviceB).with(as(actor, "service.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"name\":\"Blocked\",\"slug\":\"blocked-service\",\"durationMinutes\":60,\"bookingEnabled\":true,\"active\":true,\"featured\":false,\"sortOrder\":0}"))
            .andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/operations/catalog/courses/{id}", courseB).with(as(actor, "course.manage")).with(csrf())
                .contentType("application/json")
                .content("""
                    {
                      "name":"Blocked",
                      "slug":"blocked-course",
                      "shortDescription":"Blocked tenant course",
                      "description":"Cross-tenant mutation must remain hidden.",
                      "modality":"PRESENCIAL",
                      "durationLabel":"1 mês",
                      "scheduleSummary":"Terças e quintas",
                      "investmentAmount":1200.00,
                      "investmentCurrency":"MZN",
                      "certificateIncluded":true,
                      "learningOutcomes":["Isolamento por organização"],
                      "featured":false,
                      "active":true
                    }
                    """))
            .andExpect(status().isNotFound());
        mvc.perform(put("/api/v1/operations/catalog/spaces/{id}", spaceB).with(as(actor, "space.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"name\":\"Blocked\",\"slug\":\"blocked-space\",\"capacityMin\":1,\"capacityMax\":10,\"active\":true}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void catalogEndpointsRequireAuthorities() throws Exception {
        UserAccount actor = seedUser(seedOrganization("catalog-auth"));
        mvc.perform(get("/api/v1/operations/catalog/services").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/catalog/courses").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/catalog/spaces").with(as(actor))).andExpect(status().isForbidden());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }
    private UserAccount seedUser(UUID org) {
        UUID id = UUID.randomUUID(); String email = "catalog-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", "Catalog", "Actor", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", "Catalog", "Actor"); user.id = id; return user;
    }
    private UUID seedService(UUID org, String slug) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into services(id,organization_id,name,slug,duration_minutes,booking_enabled,featured,active,sort_order,created_at) values (?,?,?,?,60,true,false,true,0,?)", id, org, slug, slug, OffsetDateTime.now());
        return id;
    }
    private UUID seedCourse(UUID org, String slug) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into courses(id,organization_id,name,slug,active) values (?,?,?,?,true)", id, org, slug, slug);
        return id;
    }
    private void seedCourseSession(UUID course) {
        OffsetDateTime start = OffsetDateTime.now().plusDays(30);
        jdbc.update("insert into course_sessions(id,course_id,start_at,end_at,active) values (?,?,?,?,true)", UUID.randomUUID(), course, start, start.plusHours(2));
    }
    private UUID seedSpace(UUID org, String slug) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into spaces(id,organization_id,name,slug,capacity_min,capacity_max,active) values (?,?,?,?,1,10,true)", id, org, slug, slug);
        return id;
    }
    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
