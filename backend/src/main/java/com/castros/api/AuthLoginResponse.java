package com.castros.api;

import java.util.List;
import java.util.UUID;

public record AuthLoginResponse(String email, boolean authenticated, UUID organizationId, String firstName, String lastName, String experienceType, List<String> permissions) { }
