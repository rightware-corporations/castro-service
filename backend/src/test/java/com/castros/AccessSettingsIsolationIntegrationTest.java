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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "CASTROS_RUN_POSTGRES_IT", matches = "true")
class AccessSettingsIsolationIntegrationTest {
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
    void usersRolesAndSettingsStayInsideAuthenticatedOrganization() throws Exception {
        UUID orgA = seedOrganization("access-a");
        UUID orgB = seedOrganization("access-b");
        UserAccount actor = seedUser(orgA, "actor");
        UUID ownUser = seedUser(orgA, "own").id;
        UUID foreignUser = seedUser(orgB, "foreign").id;
        UUID ownRole = seedRole(orgA, "Own Role");
        UUID foreignRole = seedRole(orgB, "Foreign Role");

        mvc.perform(get("/api/v1/operations/access/users").with(as(actor, "user.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/v1/operations/access/roles").with(as(actor, "role.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].id").value(ownRole.toString()));

        mvc.perform(put("/api/v1/operations/access/users/{id}", foreignUser).with(as(actor, "user.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"blocked@example.test\",\"firstName\":\"Blocked\",\"lastName\":\"User\",\"active\":true,\"roleId\":null}"))
            .andExpect(status().isNotFound());

        mvc.perform(put("/api/v1/operations/access/users/{id}", ownUser).with(as(actor, "user.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"own-updated@example.test\",\"firstName\":\"Own\",\"lastName\":\"User\",\"active\":true,\"roleId\":\"" + foreignRole + "\"}"))
            .andExpect(status().isBadRequest());
        Integer memberships = jdbc.queryForObject("select count(*) from organization_members where organization_id=? and user_id=?", Integer.class, orgA, ownUser);
        assertEquals(0, memberships);

        mvc.perform(get("/api/v1/operations/settings/general").with(as(actor, "settings.read")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.organizationId").value(orgA.toString()));
        mvc.perform(put("/api/v1/operations/settings/general").with(as(actor, "settings.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"organizationName\":\"Organization A Updated\",\"businessTimezone\":\"Africa/Maputo\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.organizationId").value(orgA.toString()));
        String foreignName = jdbc.queryForObject("select name from organizations where id=?", String.class, orgB);
        if (foreignName == null || !foreignName.startsWith("access-b")) throw new AssertionError("Foreign organization was modified");
    }

    @Test
    void currentAdministratorCannotMoveToWeakRoleOrStripOwnRoleManagement() throws Exception {
        UUID org = seedOrganization("access-self-lockout");
        UserAccount actor = seedUser(org, "admin");
        UUID adminRole = seedRole(org, "Administrator");
        UUID weakRole = seedRole(org, "Viewer");
        assignRole(org, actor.id, adminRole);
        grant(adminRole, "user.manage");
        grant(adminRole, "role.manage");
        grant(weakRole, "user.read");

        mvc.perform(put("/api/v1/operations/access/users/{id}", actor.id)
                .with(as(actor, "user.manage", "role.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"email\":\"" + actor.email + "\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"active\":true,\"roleId\":\"" + weakRole + "\"}"))
            .andExpect(status().isConflict());

        UUID retainedRole = jdbc.queryForObject("select role_id from organization_members where organization_id=? and user_id=?", UUID.class, org, actor.id);
        assertEquals(adminRole, retainedRole);

        mvc.perform(put("/api/v1/operations/access/roles/{id}", adminRole)
                .with(as(actor, "role.manage")).with(csrf())
                .contentType("application/json")
                .content("{\"name\":\"Administrator\",\"permissionCodes\":[\"user.manage\"]}"))
            .andExpect(status().isConflict());

        Integer retainedPermissions = jdbc.queryForObject("""
            select count(*) from role_permissions rp join permissions p on p.id=rp.permission_id
            where rp.role_id=? and p.code in ('user.manage','role.manage')
            """, Integer.class, adminRole);
        assertEquals(2, retainedPermissions);
    }

    @Test
    void accessAndSettingsRequireAuthorities() throws Exception {
        UserAccount actor = seedUser(seedOrganization("access-auth"), "actor");
        mvc.perform(get("/api/v1/operations/access/users").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/access/roles").with(as(actor))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/operations/settings/general").with(as(actor))).andExpect(status().isForbidden());
    }

    private UUID seedOrganization(String prefix) {
        UUID id = UUID.randomUUID();
        jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,true,?)", id, prefix + " " + id, prefix + "-" + id, OffsetDateTime.now());
        return id;
    }
    private UserAccount seedUser(UUID org, String prefix) {
        UUID id = UUID.randomUUID(); String email = prefix + "-" + id + "@example.test";
        jdbc.update("insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at) values (?,?,?,?,?,?,true,?)", id, org, email, "unused", prefix, "User", OffsetDateTime.now());
        UserAccount user = new UserAccount(org, email, "unused", prefix, "User"); user.id = id; return user;
    }
    private UUID seedRole(UUID org, String name) {
        UUID id = UUID.randomUUID(); jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", id, org, name + " " + id); return id;
    }
    private void assignRole(UUID org, UUID userId, UUID roleId) {
        jdbc.update("insert into organization_members(id,organization_id,user_id,role_id) values (?,?,?,?)", UUID.randomUUID(), org, userId, roleId);
    }
    private void grant(UUID roleId, String permissionCode) {
        jdbc.update("""
            insert into role_permissions(id,role_id,permission_id)
            select ?,?,id from permissions where code=?
            """, UUID.randomUUID(), roleId, permissionCode);
    }
    private RequestPostProcessor as(UserAccount user, String... permissions) {
        user.withPermissionCodes(Set.of(permissions));
        return authentication(new UsernamePasswordAuthenticationToken(user, "n/a", user.getAuthorities()));
    }
    private static String env(String name, String fallback) { String value = System.getenv(name); return value == null || value.isBlank() ? fallback : value; }
}
