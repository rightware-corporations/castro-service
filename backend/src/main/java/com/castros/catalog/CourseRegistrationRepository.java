package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, UUID> {
    Optional<CourseRegistration> findByOrganizationIdAndId(UUID organizationId, UUID id);
    Optional<CourseRegistration> findByOrganizationIdAndIdempotencyKey(UUID organizationId, String idempotencyKey);
    List<CourseRegistration> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
