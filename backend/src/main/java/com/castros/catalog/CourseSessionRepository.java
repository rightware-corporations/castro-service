package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CourseSessionRepository extends JpaRepository<CourseSession, UUID> {
    List<CourseSession> findByCourseIdAndActiveTrueOrderByStartAtAsc(UUID courseId);
    List<CourseSession> findAllByCourseIdOrderByStartAtAsc(UUID courseId);
    Optional<CourseSession> findByCourseIdAndId(UUID courseId, UUID id);
}
