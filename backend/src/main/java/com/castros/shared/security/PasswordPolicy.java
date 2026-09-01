package com.castros.shared.security;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class PasswordPolicy {
    private static final int MIN_LENGTH = 12;
    private static final int MAX_LENGTH = 200;

    public void validate(String password, String email) {
        if (password == null || password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Password must contain between 12 and 200 characters");
        }
        String normalized = password.toLowerCase(Locale.ROOT);
        if (normalized.equals("password") || normalized.equals("password123") || normalized.equals("castros") || normalized.equals("castros123")) {
            throw new IllegalArgumentException("Password is too common");
        }
        if (email != null && !email.isBlank()) {
            String localPart = email.trim().toLowerCase(Locale.ROOT).split("@", 2)[0];
            if (localPart.length() >= 4 && normalized.contains(localPart)) {
                throw new IllegalArgumentException("Password must not contain the email identifier");
            }
        }
    }
}
