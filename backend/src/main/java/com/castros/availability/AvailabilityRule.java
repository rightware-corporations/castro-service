package com.castros.availability;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="availability_rules")
public class AvailabilityRule { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID organizationId; @Column(nullable=false) public String bookableType; @Column(nullable=false) public UUID bookableId; @Column(nullable=false) @Enumerated(EnumType.STRING) public DayOfWeek dayOfWeek; @Column(nullable=false) public LocalTime opensAt; @Column(nullable=false) public LocalTime closesAt; @Column(nullable=false) public int slotIntervalMinutes=30; public int bufferBeforeMinutes; public int bufferAfterMinutes; public int minimumNoticeMinutes; public int maximumAdvanceDays=90; @Column(nullable=false) public boolean active=true; protected AvailabilityRule(){} }
