package com.castros.catalog;

import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="courses")
public class Course { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID organizationId; @Column(nullable=false) public String name; @Column(nullable=false) public String slug; public String description; @Column(nullable=false) public boolean active=true; protected Course(){} }
