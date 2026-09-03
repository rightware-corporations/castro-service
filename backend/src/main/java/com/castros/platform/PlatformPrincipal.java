package com.castros.platform;

import java.util.UUID;

public record PlatformPrincipal(UUID id, String email, String firstName, String lastName) { }
