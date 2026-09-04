package com.castros.catalog;

import com.castros.booking.BookingConfirmationMode;
import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="spaces")
public class Space {
    @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
    @Column(nullable=false) public UUID organizationId;
    @Column(nullable=false) public String name;
    @Column(nullable=false) public String slug;
    public String description;
    public String location;
    public Integer capacityMin;
    public Integer capacityMax;
    public java.math.BigDecimal sizeSquareMeters;
    @Column(nullable=false) public boolean bookingEnabled=true;
    @Column(nullable=false) @Enumerated(EnumType.STRING) public BookingConfirmationMode confirmationMode=BookingConfirmationMode.MANUAL;
    @Column(nullable=false) public boolean active=true;
    protected Space(){}
}
