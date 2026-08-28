package com.castros.api;
import java.util.UUID;
public record SpaceItem(UUID id,String name,String slug,String description,String location,Integer capacityMin,Integer capacityMax) { }
