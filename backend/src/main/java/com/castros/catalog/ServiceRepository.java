package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ServiceRepository extends JpaRepository<ServiceEntity, UUID> { List<ServiceEntity> findByActiveTrueOrderBySortOrderAsc(); Optional<ServiceEntity> findBySlugAndActiveTrue(String slug); }
