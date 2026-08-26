package com.castros.api;
import java.time.OffsetDateTime;
import java.util.UUID;
public record BookingResponse(UUID id,String reference,String status,OffsetDateTime startAt,OffsetDateTime endAt) { }
