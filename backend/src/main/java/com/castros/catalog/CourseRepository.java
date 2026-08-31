package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByActiveTrueOrderByNameAsc();
    Optional<Course> findBySlugAndActiveTrue(String slug);
    List<Course> findAllByOrganizationIdOrderByNameAsc(UUID organizationId);
    Optional<Course> findByOrganizationIdAndId(UUID organizationId, UUID id);
    Optional<Course> findByOrganizationIdAndSlug(UUID organizationId, String slug);
}
