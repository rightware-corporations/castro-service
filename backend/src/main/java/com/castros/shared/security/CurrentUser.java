package com.castros.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public String email(Authentication authentication) { return authentication == null ? null : authentication.getName(); }
}
