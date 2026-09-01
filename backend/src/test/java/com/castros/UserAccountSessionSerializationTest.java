package com.castros;

import com.castros.user.UserAccount;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserAccountSessionSerializationTest {
    @Test
    void authenticatedPrincipalIsSerializableForJdbcSessions() throws Exception {
        UserAccount original = new UserAccount(UUID.randomUUID(), "operator@example.invalid", "hash", "Operator", "Test")
            .withPermissionCodes(List.of("booking.read", "settings.read"));

        byte[] bytes;
        try (ByteArrayOutputStream buffer = new ByteArrayOutputStream(); ObjectOutputStream output = new ObjectOutputStream(buffer)) {
            output.writeObject(original);
            bytes = buffer.toByteArray();
        }

        UserAccount restored;
        try (ObjectInputStream input = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            restored = (UserAccount) input.readObject();
        }

        assertEquals(original.getUsername(), restored.getUsername());
        assertEquals(original.organizationId, restored.organizationId);
        assertEquals(List.of("booking.read", "settings.read"), restored.getAuthorities().stream().map(Object::toString).toList());
    }
}
