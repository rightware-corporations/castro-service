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
class ContentSpaceIsolationIntegrationTest {
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
    void contentAndSpaceExperienceAreOrganizationScoped() throws Exception {
        UUID orgA = seedOrganization("content-space-a");
        UUID orgB = seedOrganization("content-space-b");
        UserAccount actor = seedUser(orgA);
        UUID contentA = seedContent(orgA, "home.a");
        UUID contentB = seedContent(orgB, "home.b");
        UUID spaceA = seedSpace(orgA, "space-a");
        UUID spaceB = seedSpace(orgB, "space-b");
        seedLayout(spaceA, "Layout A");
        seedLayout(spaceB, "Layout B");
        seedResource(spaceA, "Resource A");
        seedResource(spaceB, "Resource B");
        seedScene(spaceA, "Scene A");
        seedScene(spaceB, "Scene B");

        mvc.perform(get("/api/v1/operations/content").with(as(actor, "content.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(contentA.toString()));
        mvc.perform(put("/api/v1/operations/content/{id}", contentB).with(as(actor, "content.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"contentKey\":\"blocked.key\",\"title\":\"Blocked\",\"body\":\"Blocked\",\"status\":\"DRAFT\"}"))
            .andExpect(status().isNotFound());

        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/layouts", spaceA).with(as(actor, "space.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/resources", spaceA).with(as(actor, "space.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/scenes", spaceA).with(as(actor, "space.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/layouts", spaceB).with(as(actor, "space.read"))).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/resources", spaceB).with(as(actor, "space.read"))).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/scenes", spaceB).with(as(actor, "space.read"))).andExpect(status().isNotFound());
    }

    @Test
    void contentAndSpaceExperienceRequireAuthorities() throws Exception {
        UUID org = seedOrganization("content-space-auth"); UserAccount actor = seedUser(org); UUID space = seedSpace(org, "space-auth");
        mvc.perform(get("/api/v1/operations/content").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/layouts", space).with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/resources", space).with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/spaces/{spaceId}/scenes", space).with(as(actor))).andExpect(status().isForbidden());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID(); jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now()); return id;
    }
    private UserAccount seedUser(UUID org) {
        UUID id = UUID.randomUUID(); String email = "content-space-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", "Content", "Actor", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", "Content", "Actor"); user.id = id; return user;
    }
    private UUID seedContent(UUID org, String key) {
        UUID id = UUID.randomUUID(); OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("insert into content_entries(id,organization_id,content_key,title,body,status,created_at,updated_at) values (?,?,?,?,?,'DRAFT',?,?)", id, org, key, key, "body", now, now); return id;
    }
    private UUID seedSpace(UUID org, String slug) {
        UUID id = UUID.randomUUID(); jdbc.update("insert into spaces(id,organization_id,name,slug,active) values (?,?,?,?,true)", id, org, slug, slug); return id;
    }
    private void seedLayout(UUID space, String name) {
        OffsetDateTime now = OffsetDateTime.now(); jdbc.update("insert into space_layouts(id,space_id,name,description,capacity,active,sort_order,created_at,updated_at) values (?,?,?,?,?,true,0,?,?)", UUID.randomUUID(), space, name, null, 10, now, now);
    }
    private void seedResource(UUID space, String name) {
        OffsetDateTime now = OffsetDateTime.now(); jdbc.update("insert into space_resources(id,space_id,name,description,quantity,active,sort_order,created_at,updated_at) values (?,?,?,?,?,true,0,?,?)", UUID.randomUUID(), space, name, null, 1, now, now);
    }
    private void seedScene(UUID space, String title) {
        jdbc.update("insert into space_scenes(id,space_id,panorama_url,title,initial_yaw,initial_pitch,sort_order) values (?,?,?,?,0,0,0)", UUID.randomUUID(), space, "https://example.test/panorama.jpg", title);
    }
    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions)); return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
