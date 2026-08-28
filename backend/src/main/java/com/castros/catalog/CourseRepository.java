package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CourseRepository extends JpaRepository<Course, UUID> { List<Course> findByActiveTrueOrderByNameAsc(); Optional<Course> findBySlugAndActiveTrue(String slug); }
