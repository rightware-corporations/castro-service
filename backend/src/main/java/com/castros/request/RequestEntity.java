package com.castros.request;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "requests")
public class RequestEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false)
    public UUID organizationId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public RequestType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    public RequestStatus status = RequestStatus.NEW;

    @Column(nullable = false)
    public UUID customerId;

    public String message;
    public String idempotencyKey;
    public String idempotencyFingerprint;

    @Enumerated(EnumType.STRING)
    public RequestSourceType sourceType;
    public UUID sourceEntityId;
    public String sourceEntitySlug;
    public String sourceEntityName;
    public String sourceCta;
    public String sourcePath;
    public String entryPath;
    public String referrer;
    public String utmSource;
    public String utmMedium;
    public String utmCampaign;

    public OffsetDateTime createdAt = OffsetDateTime.now();

    protected RequestEntity() {}

    public RequestEntity(UUID org, UUID customer, RequestType type, String message) {
        organizationId = org;
        customerId = customer;
        this.type = type;
        this.message = message;
    }
}
