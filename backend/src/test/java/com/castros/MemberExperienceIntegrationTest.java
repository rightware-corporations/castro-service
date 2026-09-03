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
class MemberExperienceIntegrationTest {
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
    void authSessionExposesOwnerExperienceIndependentlyFromRoleName() throws Exception {
        UUID org = seedOrganization("experience-owner");
        UserAccount owner = seedUser(org, "owner");
        UUID arbitraryRole = seedRole(org, "Executive Visibility");
        assignRole(org, owner.id, arbitraryRole, "OWNER");

        mvc.perform(get("/api/v1/auth/me").with(as(owner)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.experienceType").value("OWNER"));

        jdbc.update("update organization_members set experience_type='OPERATIONS' where organization_id=? and user_id=?", org, owner.id);

        mvc.perform(get("/api/v1/auth/me").with(as(owner)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.experienceType").value("OPERATIONS"));
    }

    @Test
    void accessAdministrationCanAssignOwnerExperienceButRejectsUnknownExperience() throws Exception {
        UUID org = seedOrganization("experience-admin");
        UserAccount actor = seedUser(org, "actor");
        UUID adminRole = seedRole(org, "Access Administrator");
        UUID targetRole = seedRole(org, "Operational Permissions");
        assignRole(org, actor.id, adminRole, "OPERATIONS");
        UUID target = seedUser(org, "target").id;

        mvc.perform(put("/api/v1/operations/access/users/{id}", target)
                .with(as(actor, "user.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"target-updated@example.test\",\"firstName\":\"Target\",\"lastName\":\"Owner\",\"active\":true,\"roleId\":\"" + targetRole + "\",\"experienceType\":\"OWNER\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.experienceType").value("OWNER"));

        mvc.perform(put("/api/v1/operations/access/users/{id}", target)
                .with(as(actor, "user.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"target-updated@example.test\",\"firstName\":\"Target\",\"lastName\":\"Owner\",\"active\":true,\"roleId\":\"" + targetRole + "\",\"experienceType\":\"MANAGER\"}"))
            .andExpect(status().isBadRequest());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }

    private UserAccount seedUser(UUID org, String prefix) {
        UUID id = UUID.randomUUID();
        String email = prefix + "-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", prefix, "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", prefix, "User");
        user.id = id;
        return user;
    }

    private UUID seedRole(UUID org, String name) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", id, org, name + " " + id);
        return id;
    }

    private void assignRole(UUID org, UUID userId, UUID roleId, String experience) {
        jdbc.update("insert into organization_members(id,organization_id,user_id,role_id,experience_type) values (?,?,?,?,?)", UUID.randomUUID(), org, userId, roleId, experience);
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
