package com.castros.api;
import java.time.OffsetDateTime;
public record PublicBookingLookup(String reference,String status,OffsetDateTime startAt,OffsetDateTime endAt) { }
