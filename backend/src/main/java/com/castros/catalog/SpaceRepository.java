package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SpaceRepository extends JpaRepository<Space, UUID> { List<Space> findByActiveTrueOrderByNameAsc(); Optional<Space> findBySlugAndActiveTrue(String slug); }
