package com.castros;

import com.castros.api.RequestController;
import com.castros.request.RequestSourceType;
import com.castros.request.RequestType;
import com.castros.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class RequestIntentContextIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired RequestController controller;

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("CASTROS_IT_DATABASE_URL", "jdbc:postgresql://localhost:5432/castros_it"));
        registry.add("spring.datasource.username", () -> env("CASTROS_IT_DATABASE_USERNAME", "castros"));
        registry.add("spring.datasource.password", () -> env("CASTROS_IT_DATABASE_PASSWORD", "castros"));
    }

    @Test
    @Transactional
    void requestStoresCanonicalTrainingContextAndAttribution() {
        jdbc.update("update organizations set active=false");
        UUID org = UUID.randomUUID();
        UUID course = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", org, "Intent Org " + org, "intent-" + org, OffsetDateTime.now());
        jdbc.update("insert into courses(id,organization_id,name,slug,description,active) values (?,?,?,?,?,true)", course, org, "Liderança Canónica", "lideranca-canonica", "Teste");

        RequestController.RequestContextInput context = new RequestController.RequestContextInput(
            RequestSourceType.TRAINING, course, "TRAINING_DATES", "/formacao/lideranca-canonica",
            "/?utm_source=instagram", "https://instagram.com/", "instagram", "social", "setembro"
        );
        RequestController.RequestInput input = new RequestController.RequestInput(
            "Ana", "Silva", "intent-" + UUID.randomUUID() + "@example.test", "+258840000000",
            RequestType.TRAINING_INFO, "Quero receber próximas datas.", context
        );

        var response = controller.create(null, input);
        Map<String, Object> stored = jdbc.queryForMap("""
            select source_type,source_entity_id,source_entity_slug,source_entity_name,source_cta,source_path,
                   entry_path,referrer,utm_source,utm_medium,utm_campaign
            from requests where id=?
            """, response.id());

        assertEquals("TRAINING", stored.get("source_type"));
        assertEquals(course, stored.get("source_entity_id"));
        assertEquals("lideranca-canonica", stored.get("source_entity_slug"));
        assertEquals("Liderança Canónica", stored.get("source_entity_name"));
        assertEquals("TRAINING_DATES", stored.get("source_cta"));
        assertEquals("instagram", stored.get("utm_source"));
        assertEquals("social", stored.get("utm_medium"));
        assertEquals("setembro", stored.get("utm_campaign"));
    }

    @Test
    @Transactional
    void requestRejectsContextForEntityOutsideSelectedOrganization() {
        jdbc.update("update organizations set active=false");
        UUID org = UUID.randomUUID();
        UUID otherOrg = UUID.randomUUID();
        UUID service = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", org, "Primary " + org, "primary-" + org, OffsetDateTime.now());
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,false,?)", otherOrg, "Other " + otherOrg, "other-" + otherOrg, OffsetDateTime.now());
        jdbc.update("insert into services(id,organization_id,name,slug,booking_enabled,featured,active,sort_order,created_at) values (?,?,?,?,false,false,true,0,?)",
            service, otherOrg, "Other service", "other-service-" + service, OffsetDateTime.now());

        RequestController.RequestContextInput context = new RequestController.RequestContextInput(
            RequestSourceType.SERVICE, service, "SERVICE_INFO", "/servicos/outro", "/", null, null, null, null
        );
        RequestController.RequestInput input = new RequestController.RequestInput(
            "Ana", "Silva", "isolation-" + UUID.randomUUID() + "@example.test", null, RequestType.CONSULTATION, null, context
        );

        ApiException error = assertThrows(ApiException.class, () -> controller.create(null, input));
        assertEquals("VALIDATION_FAILED", error.getCode());
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
