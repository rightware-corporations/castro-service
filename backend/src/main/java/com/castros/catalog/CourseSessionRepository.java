package com.castros.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface CourseSessionRepository extends JpaRepository<CourseSession, UUID> {
    List<CourseSession> findByCourseIdAndActiveTrueOrderByStartAtAsc(UUID courseId);
    List<CourseSession> findAllByCourseIdOrderByStartAtAsc(UUID courseId);
    Optional<CourseSession> findByCourseIdAndId(UUID courseId, UUID id);

    @Query("select s from CourseSession s join Course c on c.id = s.courseId where s.id = :id and c.organizationId = :organizationId")
    Optional<CourseSession> findByOrganizationIdAndId(@Param("organizationId") UUID organizationId, @Param("id") UUID id);
}
