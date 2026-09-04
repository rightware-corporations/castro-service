package com.castros.catalog;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_registrations")
public class CourseRegistration {
    @Id @GeneratedValue(strategy = GenerationType.UUID) public UUID id;
    @Column(nullable = false) public UUID organizationId;
    @Column(nullable = false) public UUID courseId;
    @Column(nullable = false) public UUID courseSessionId;
    @Column(nullable = false) public UUID customerId;
    @Column(nullable = false, unique = true) public String reference;
    @Enumerated(EnumType.STRING) @Column(nullable = false) public CourseRegistrationStatus status = CourseRegistrationStatus.PENDING;
    @Column(nullable = false) public int participantCount;
    public String organizationName;
    public String notes;
    public String idempotencyKey;
    public String idempotencyFingerprint;
    @Column(nullable = false) public OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(nullable = false) public OffsetDateTime updatedAt = OffsetDateTime.now();

    protected CourseRegistration() { }

    public CourseRegistration(UUID organizationId, UUID courseId, UUID courseSessionId, UUID customerId,
                              String reference, int participantCount) {
        this.organizationId = organizationId;
        this.courseId = courseId;
        this.courseSessionId = courseSessionId;
        this.customerId = customerId;
        this.reference = reference;
        this.participantCount = participantCount;
    }
}
