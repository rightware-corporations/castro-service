package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SpaceRepository extends JpaRepository<Space, UUID> {
    List<Space> findByActiveTrueOrderByNameAsc();
    Optional<Space> findBySlugAndActiveTrue(String slug);
    List<Space> findAllByOrganizationIdOrderByNameAsc(UUID organizationId);
    Optional<Space> findByOrganizationIdAndId(UUID organizationId, UUID id);
    Optional<Space> findByOrganizationIdAndSlug(UUID organizationId, String slug);
}
