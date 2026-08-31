package com.castros.booking;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="bookings", uniqueConstraints=@UniqueConstraint(name="uq_bookings_org_idempotency", columnNames={"organization_id","idempotency_key"}))
public class Booking { @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id; @Column(nullable=false) public UUID organizationId; @Column(nullable=false) public UUID customerId; @Column(nullable=false) @Enumerated(EnumType.STRING) public BookableType bookableType; @Column(nullable=false) public UUID bookableId; @Column(nullable=false) public OffsetDateTime startAt; @Column(nullable=false) public OffsetDateTime endAt; @Column(nullable=false) @Enumerated(EnumType.STRING) public BookingStatus status=BookingStatus.PENDING; @Column(nullable=false,unique=true) public String reference; public String notes; public Integer participants; public String idempotencyKey; public String idempotencyFingerprint; public UUID layoutId; public String purpose; public OffsetDateTime createdAt=OffsetDateTime.now(); public OffsetDateTime updatedAt=OffsetDateTime.now(); protected Booking(){} public Booking(UUID org,UUID customer,BookableType type,UUID resource,OffsetDateTime start,OffsetDateTime end,String reference){organizationId=org;customerId=customer;bookableType=type;bookableId=resource;startAt=start;endAt=end;this.reference=reference;} }
