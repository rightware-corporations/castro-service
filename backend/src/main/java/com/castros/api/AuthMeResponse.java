package com.castros.api;

import java.util.List;
import java.util.UUID;

public record AuthMeResponse(String email, boolean authenticated, UUID organizationId, String firstName, String lastName, List<String> permissions) { }
