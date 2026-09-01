package com.castros.security;

import com.castros.shared.security.PasswordPolicy;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PasswordPolicyTest {
    private final PasswordPolicy policy = new PasswordPolicy();

    @Test
    void acceptsLongNonTrivialPassword() {
        assertDoesNotThrow(() -> policy.validate("A-long-passphrase-2026!", "admin@example.com"));
    }

    @Test
    void rejectsShortPassword() {
        assertThrows(IllegalArgumentException.class, () -> policy.validate("short123", "admin@example.com"));
    }

    @Test
    void rejectsPasswordContainingEmailIdentifier() {
        assertThrows(IllegalArgumentException.class, () -> policy.validate("admin-secure-passphrase-2026", "admin@example.com"));
    }
}
