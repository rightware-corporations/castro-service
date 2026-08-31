package com.castros.catalog;

import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="space_scenes")
public class SpaceScene { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID spaceId; @Column(nullable=false) public String panoramaUrl; public String title; public double initialYaw; public double initialPitch; public int sortOrder; protected SpaceScene(){} }
