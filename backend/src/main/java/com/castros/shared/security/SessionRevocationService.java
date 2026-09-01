package com.castros.shared.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class SessionRevocationService {
    private final JdbcTemplate jdbc;

    public SessionRevocationService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public int revokePrincipal(String principalName) {
        if (principalName == null || principalName.isBlank()) return 0;
        return jdbc.update("delete from SPRING_SESSION where lower(PRINCIPAL_NAME)=lower(?)", principalName.trim());
    }

    public int revokePrincipals(Collection<String> principalNames) {
        if (principalNames == null || principalNames.isEmpty()) return 0;
        int revoked = 0;
        for (String principalName : principalNames) revoked += revokePrincipal(principalName);
        return revoked;
    }
}
