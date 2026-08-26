package com.castros.platform;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="roles") class Role { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String name; }
@Entity @Table(name="permissions") class Permission { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false,unique=true) String code; }
@Entity @Table(name="organization_members") class OrganizationMember { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) UUID userId; @Column(nullable=false) UUID roleId; }
@Entity @Table(name="role_permissions") class RolePermission { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID roleId; @Column(nullable=false) UUID permissionId; }
@Entity @Table(name="service_categories") class ServiceCategory { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String name; }
@Entity @Table(name="course_categories") class CourseCategory { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String name; }
@Entity @Table(name="space_layouts") class SpaceLayout { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID spaceId; @Column(nullable=false) String name; }
@Entity @Table(name="amenities") class Amenity { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String name; }
@Entity @Table(name="space_amenities") class SpaceAmenity { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID spaceId; @Column(nullable=false) UUID amenityId; }
@Entity @Table(name="space_configurations") class SpaceConfiguration { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID spaceId; @Column(nullable=false) String name; }
@Entity @Table(name="outbox_events") class OutboxEvent { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) String eventType; @Column(nullable=false) UUID aggregateId; UUID organizationId; @Column(nullable=false) OffsetDateTime occurredAt; @Column(nullable=false) String payload; @Column(nullable=false) boolean published=false; }
@Entity @Table(name="audit_records") class AuditRecord { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; UUID organizationId; UUID actorId; @Column(nullable=false) String entityType; @Column(nullable=false) UUID entityId; @Column(nullable=false) String action; String metadata; @Column(nullable=false) OffsetDateTime createdAt; }
@Entity @Table(name="content_entries") class ContentEntry { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String contentKey; @Column(nullable=false) String value; @Column(nullable=false) boolean active=true; }
@Entity @Table(name="media_assets") class MediaAsset { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID organizationId; @Column(nullable=false) String mediaType; @Column(nullable=false) String storageKey; String mimeType; Long sizeBytes; @Column(nullable=false) boolean publicVisible=false; }
@Entity @Table(name="space_media") class SpaceMedia { @Id @GeneratedValue(strategy=GenerationType.UUID) UUID id; @Column(nullable=false) UUID spaceId; @Column(nullable=false) UUID mediaId; }
