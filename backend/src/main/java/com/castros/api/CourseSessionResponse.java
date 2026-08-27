package com.castros.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CourseSessionResponse(UUID id, OffsetDateTime startAt, OffsetDateTime endAt) { }
