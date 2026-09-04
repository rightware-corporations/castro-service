package com.castros.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false)
    public UUID organizationId;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String slug;

    public String shortDescription;
    public String description;
    public String modality;
    public String durationLabel;
    public String scheduleSummary;
    public BigDecimal investmentAmount;
    public String investmentCurrency;

    @Column(nullable = false)
    public boolean certificateIncluded = false;

    public String contactPhone;
    public String learningOutcomes;

    @Column(nullable = false)
    public boolean featured = false;

    @Column(nullable = false)
    public boolean active = true;

    protected Course() {}
}
