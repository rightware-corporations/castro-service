package com.castros.shared.exception;

import java.time.OffsetDateTime;
import java.util.Map;

public record ProblemDetailResponse(String code, String message, int status, OffsetDateTime timestamp, Map<String, Object> details) { }
