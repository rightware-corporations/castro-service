package com.castros.catalog;

import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="space_hotspots")
public class SpaceHotspot { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID sceneId; @Column(nullable=false) public String title; public String description; public double yaw; public double pitch; public String type; public UUID targetSceneId; public UUID amenityId; protected SpaceHotspot(){} }
