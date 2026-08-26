package com.castros.api;
import java.util.UUID;
public record CatalogItem(UUID id,String name,String slug,String description,Integer durationMinutes,Boolean bookingEnabled) { }
