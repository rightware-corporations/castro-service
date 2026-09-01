package com.castros.shared.security;

import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;

@Service
public class SessionRevocationService {
    private final FindByIndexNameSessionRepository<? extends Session> sessions;

    public SessionRevocationService(FindByIndexNameSessionRepository<? extends Session> sessions) {
        this.sessions = sessions;
    }

    public void revokePrincipal(String principalName) {
        if (principalName == null || principalName.isBlank()) return;
        sessions.findByPrincipalName(principalName).keySet().forEach(sessions::deleteById);
    }
}
