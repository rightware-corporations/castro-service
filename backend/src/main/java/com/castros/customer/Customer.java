package com.castros.customer;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false)
    public UUID organizationId;

    @Column(nullable = false)
    public String firstName;

    public String lastName;
    public String email;
    public String phone;
    public String company;
    public String notes;
    public String source;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public CustomerLifecycleStage lifecycleStage = CustomerLifecycleStage.LEAD;

    public OffsetDateTime createdAt = OffsetDateTime.now();
    public OffsetDateTime updatedAt = OffsetDateTime.now();

    protected Customer() {}

    public Customer(UUID org, String firstName, String lastName, String email, String phone, String source) {
        this.organizationId = org;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.source = source;
        this.lifecycleStage = CustomerLifecycleStage.LEAD;
    }
}
