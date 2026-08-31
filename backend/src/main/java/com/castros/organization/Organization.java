package com.castros.organization;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="organizations")
public class Organization {
    @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
    @Column(nullable=false, unique=true) public String name;
    @Column(nullable=false, unique=true) public String slug;
    @Column(name="business_timezone") public String businessTimezone;
    @Column(nullable=false) public boolean active = true;
    @Column(nullable=false) public OffsetDateTime createdAt = OffsetDateTime.now();
    protected Organization() { }
    public Organization(String name, String slug) { this.name=name; this.slug=slug; }
}
