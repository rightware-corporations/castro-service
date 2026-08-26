package com.castros.availability;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="blocked_periods")
public class BlockedPeriod { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID organizationId; @Column(nullable=false) public String bookableType; @Column(nullable=false) public UUID bookableId; @Column(nullable=false) public OffsetDateTime startAt; @Column(nullable=false) public OffsetDateTime endAt; public String reason; protected BlockedPeriod(){} }
