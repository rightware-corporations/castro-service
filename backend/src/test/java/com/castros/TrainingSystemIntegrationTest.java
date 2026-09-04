package com.castros;

import com.castros.user.UserAccount;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.MvcResult;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class TrainingSystemIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;
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
    void twoDifferentCoursesUseTheSameReusableAdministrationContract() throws Exception {
        UUID organizationId = seedOrganization();
        UserAccount actor = seedUser(organizationId);

        String publicSpeakingSlug = "public-speaking-" + UUID.randomUUID();
        String leadershipSlug = "leadership-" + UUID.randomUUID();

        MvcResult first = createCourse(actor, "Oratória Aplicada", publicSpeakingSlug,
            "Comunicação clara e confiante.", "PRESENCIAL", "4 semanas",
            "Terças e quintas", "1200.00", "MZN", true, true,
            "Comunicação assertiva", "Presença em público");
        MvcResult second = createCourse(actor, "Liderança de Equipas", leadershipSlug,
            "Liderança para equipas em crescimento.", "HÍBRIDO", "6 semanas",
            "Sábados", "2500.00", "MZN", false, false,
            "Delegação", "Feedback estruturado");

        JsonNode firstBody = objectMapper.readTree(first.getResponse().getContentAsString());
        JsonNode secondBody = objectMapper.readTree(second.getResponse().getContentAsString());
        UUID firstId = UUID.fromString(firstBody.get("id").asText());

        mvc.perform(get("/api/v1/operations/catalog/courses").with(as(actor, "course.read")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.slug == '%s')].shortDescription".formatted(publicSpeakingSlug)).value("Comunicação clara e confiante."))
            .andExpect(jsonPath("$[?(@.slug == '%s')].modality".formatted(leadershipSlug)).value("HÍBRIDO"))
            .andExpect(jsonPath("$[?(@.slug == '%s')].investmentAmount".formatted(publicSpeakingSlug)).value(1200.0))
            .andExpect(jsonPath("$[?(@.slug == '%s')].learningOutcomes.length()".formatted(leadershipSlug)).value(2));

        mvc.perform(get("/api/v1/courses/{slug}", publicSpeakingSlug))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Oratória Aplicada"))
            .andExpect(jsonPath("$.modality").value("PRESENCIAL"))
            .andExpect(jsonPath("$.durationLabel").value("4 semanas"))
            .andExpect(jsonPath("$.certificateIncluded").value(true))
            .andExpect(jsonPath("$.learningOutcomes[0]").value("Comunicação assertiva"))
            .andExpect(jsonPath("$.contactPhone").doesNotExist());

        mvc.perform(get("/api/v1/courses/{slug}", leadershipSlug))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Liderança de Equipas"))
            .andExpect(jsonPath("$.modality").value("HÍBRIDO"))
            .andExpect(jsonPath("$.featured").value(false))
            .andExpect(jsonPath("$.contactPhone").doesNotExist());

        OffsetDateTime start = OffsetDateTime.now().plusDays(45).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(3);
        mvc.perform(post("/api/v1/operations/catalog/courses/{courseId}/sessions", firstId)
                .with(as(actor, "course.manage")).with(csrf())
                .contentType("application/json")
                .content("""
                    {
                      "startAt":"%s",
                      "endAt":"%s",
                      "label":"Edição de Outubro",
                      "active":true
                    }
                    """.formatted(start, end)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.courseId").value(firstId.toString()))
            .andExpect(jsonPath("$.label").value("Edição de Outubro"));

        mvc.perform(get("/api/v1/courses/{id}/sessions", firstId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].label").value("Edição de Outubro"));

        // Both records were produced by the same contract while keeping different content and merchandising flags.
        org.junit.jupiter.api.Assertions.assertNotEquals(firstBody.get("id").asText(), secondBody.get("id").asText());
    }

    private MvcResult createCourse(UserAccount actor, String name, String slug, String shortDescription,
                                   String modality, String duration, String schedule, String amount,
                                   String currency, boolean certificate, boolean featured,
                                   String outcomeOne, String outcomeTwo) throws Exception {
        return mvc.perform(post("/api/v1/operations/catalog/courses")
                .with(as(actor, "course.manage")).with(csrf())
                .contentType("application/json")
                .content("""
                    {
                      "name":"%s",
                      "slug":"%s",
                      "shortDescription":"%s",
                      "description":"Descrição pública completa para %s.",
                      "modality":"%s",
                      "durationLabel":"%s",
                      "scheduleSummary":"%s",
                      "investmentAmount":%s,
                      "investmentCurrency":"%s",
                      "certificateIncluded":%s,
                      "learningOutcomes":["%s","%s"],
                      "featured":%s,
                      "active":true
                    }
                    """.formatted(name, slug, shortDescription, name, modality, duration, schedule, amount, currency, certificate, outcomeOne, outcomeTwo, featured)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").value(slug))
            .andExpect(jsonPath("$.shortDescription").value(shortDescription))
            .andExpect(jsonPath("$.investmentCurrency").value(currency))
            .andReturn();
    }

    private UUID seedOrganization() {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,?,?)",
            id, "Training Test " + id, "training-test-" + id, true, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID organizationId) {
        UUID id = UUID.randomUUID();
        String email = "training-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)",
            id, organizationId, email, "unused", "Training", "Editor", OffsetDateTime.now());
        UserAccount user = new UserAccount(organizationId, email, "unused", "Training", "Editor");
        user.id = id;
        return user;
    }

    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
