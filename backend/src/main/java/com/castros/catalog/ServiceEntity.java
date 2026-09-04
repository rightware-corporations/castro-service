package com.castros.catalog;

import com.castros.booking.BookingConfirmationMode;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="services")
public class ServiceEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
    @Column(nullable=false) public UUID organizationId;
    @Column(nullable=false) public String name;
    @Column(nullable=false) public String slug;
    public String shortDescription;
    public String description;
    public Integer durationMinutes;
    @Column(nullable=false) public boolean bookingEnabled=true;
    @Column(nullable=false) @Enumerated(EnumType.STRING) public BookingConfirmationMode confirmationMode=BookingConfirmationMode.MANUAL;
    @Column(nullable=false) public boolean active=true;
    public boolean featured;
    public int sortOrder;
    public OffsetDateTime createdAt=OffsetDateTime.now();
    protected ServiceEntity(){}
}
