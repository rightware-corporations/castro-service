package com.castros.availability;

import com.castros.booking.BookableType;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="availability_exceptions")
public class AvailabilityExceptionEntity { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID organizationId; @Column(nullable=false) @Enumerated(EnumType.STRING) public BookableType bookableType; @Column(nullable=false) public UUID bookableId; @Column(nullable=false) public LocalDate date; @Column(nullable=false) public boolean closed; public LocalTime opensAt; public LocalTime closesAt; protected AvailabilityExceptionEntity(){} }
