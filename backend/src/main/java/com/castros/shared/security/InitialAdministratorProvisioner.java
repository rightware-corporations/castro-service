package com.castros.shared.security;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Component
public class InitialAdministratorProvisioner implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final PasswordPolicy passwordPolicy;
    private final Environment environment;

    public InitialAdministratorProvisioner(JdbcTemplate jdbc, PasswordEncoder encoder, PasswordPolicy passwordPolicy, Environment environment) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.passwordPolicy = passwordPolicy;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!Boolean.parseBoolean(environment.getProperty("BOOTSTRAP_ADMIN_ENABLED", "false"))) return;

        String organizationName = required("BOOTSTRAP_ORGANIZATION_NAME");
        String organizationSlug = required("BOOTSTRAP_ORGANIZATION_SLUG").toLowerCase(Locale.ROOT);
        String email = required("BOOTSTRAP_ADMIN_EMAIL").toLowerCase(Locale.ROOT);
        String password = required("BOOTSTRAP_ADMIN_PASSWORD");
        String firstName = required("BOOTSTRAP_ADMIN_FIRST_NAME");
        String lastName = required("BOOTSTRAP_ADMIN_LAST_NAME");
        passwordPolicy.validate(password, email);

        Integer existingUser = jdbc.queryForObject("select count(*) from users where lower(email)=lower(?)", Integer.class, email);
        if (existingUser != null && existingUser > 0) {
            throw unsafe("bootstrap administrator already exists");
        }

        UUID organizationId = jdbc.query("select id from organizations where slug=?", rs -> rs.next() ? rs.getObject(1, UUID.class) : null, organizationSlug);
        if (organizationId == null) {
            organizationId = UUID.randomUUID();
            jdbc.update("insert into organizations(id,name,slug,active,created_at) values (?,?,?,?,?)", organizationId, organizationName, organizationSlug, true, OffsetDateTime.now());
        } else {
            Integer members = jdbc.queryForObject("select count(*) from users where organization_id=?", Integer.class, organizationId);
            if (members != null && members > 0) {
                throw unsafe("bootstrap is only allowed for an organization with no users");
            }
        }

        Integer bootstrapRoles = jdbc.queryForObject("select count(*) from roles where organization_id=? and name=?", Integer.class, organizationId, "Bootstrap Administrator");
        if (bootstrapRoles != null && bootstrapRoles > 0) {
            throw unsafe("bootstrap administrator role already exists");
        }

        UUID roleId = UUID.randomUUID();
        jdbc.update("insert into roles(id,organization_id,name) values (?,?,?)", roleId, organizationId, "Bootstrap Administrator");
        jdbc.update("""
            insert into role_permissions(id,role_id,permission_id)
            select gen_random_uuid(), ?, id from permissions
            """, roleId);

        UUID userId = UUID.randomUUID();
        jdbc.update("""
            insert into users(id,organization_id,email,password_hash,first_name,last_name,active,created_at)
            values (?,?,?,?,?,?,true,?)
            """, userId, organizationId, email, encoder.encode(password), firstName, lastName, OffsetDateTime.now());
        jdbc.update("insert into organization_members(id,organization_id,user_id,role_id,experience_type) values (?,?,?,?,?)", UUID.randomUUID(), organizationId, userId, roleId, "OWNER");
    }

    private String required(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) throw unsafe(key + " is required when BOOTSTRAP_ADMIN_ENABLED=true");
        return value.trim();
    }

    private IllegalStateException unsafe(String reason) {
        return new IllegalStateException("Unsafe bootstrap configuration: " + reason + ". Disable BOOTSTRAP_ADMIN_ENABLED and remove BOOTSTRAP_ADMIN_PASSWORD after one-time provisioning.");
    }
}
