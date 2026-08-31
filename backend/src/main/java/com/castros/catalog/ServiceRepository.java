package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> {
    List<ServiceEntity> findByActiveTrueOrderBySortOrderAsc();
    Optional<ServiceEntity> findBySlugAndActiveTrue(String slug);
    List<ServiceEntity> findAllByOrganizationIdOrderBySortOrderAscNameAsc(UUID organizationId);
    Optional<ServiceEntity> findByOrganizationIdAndId(UUID organizationId, UUID id);
    Optional<ServiceEntity> findByOrganizationIdAndSlug(UUID organizationId, String slug);
}
