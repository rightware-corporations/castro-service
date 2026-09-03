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
public class PlatformAdministratorProvisioner implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final PasswordPolicy passwordPolicy;
    private final Environment environment;

    public PlatformAdministratorProvisioner(JdbcTemplate jdbc, PasswordEncoder encoder, PasswordPolicy passwordPolicy, Environment environment) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.passwordPolicy = passwordPolicy;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!Boolean.parseBoolean(environment.getProperty("BOOTSTRAP_PLATFORM_ADMIN_ENABLED", "false"))) return;

        String email = required("BOOTSTRAP_PLATFORM_ADMIN_EMAIL").toLowerCase(Locale.ROOT);
        String password = required("BOOTSTRAP_PLATFORM_ADMIN_PASSWORD");
        String firstName = required("BOOTSTRAP_PLATFORM_ADMIN_FIRST_NAME");
        String lastName = required("BOOTSTRAP_PLATFORM_ADMIN_LAST_NAME");
        passwordPolicy.validate(password, email);

        Integer existingPlatformAdmins = jdbc.queryForObject("select count(*) from platform_administrators", Integer.class);
        if (existingPlatformAdmins != null && existingPlatformAdmins > 0) {
            throw unsafe("a platform administrator already exists");
        }

        Integer tenantCollision = jdbc.queryForObject("select count(*) from users where lower(email)=lower(?)", Integer.class, email);
        if (tenantCollision != null && tenantCollision > 0) {
            throw unsafe("platform administrator email is already assigned to a tenant user");
        }

        UUID administratorId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("""
            insert into platform_administrators(id,email,password_hash,first_name,last_name,active,created_at)
            values (?,?,?,?,?,true,?)
            """, administratorId, email, encoder.encode(password), firstName, lastName, now);
        jdbc.update("""
            insert into platform_audit_events(id,actor_platform_admin_id,action,entity_type,entity_id,details,created_at)
            values (?,?,?,?,?,?,?)
            """, UUID.randomUUID(), administratorId, "PLATFORM_ADMIN_BOOTSTRAPPED", "PLATFORM_ADMIN", administratorId,
            "One-time platform administrator provisioning completed", now);
    }

    private String required(String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) throw unsafe(key + " is required when BOOTSTRAP_PLATFORM_ADMIN_ENABLED=true");
        return value.trim();
    }

    private IllegalStateException unsafe(String reason) {
        return new IllegalStateException("Unsafe platform bootstrap configuration: " + reason + ". Disable BOOTSTRAP_PLATFORM_ADMIN_ENABLED and remove BOOTSTRAP_PLATFORM_ADMIN_PASSWORD after one-time provisioning.");
    }
}
