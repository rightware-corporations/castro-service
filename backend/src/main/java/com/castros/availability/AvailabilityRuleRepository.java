package com.castros.availability;

import com.castros.booking.BookableType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.*;

public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, UUID> {
    List<AvailabilityRule> findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(BookableType type, UUID id, DayOfWeek day);
    List<AvailabilityRule> findAllByOrganizationIdOrderByBookableTypeAscBookableIdAscDayOfWeekAsc(UUID organizationId);
    Optional<AvailabilityRule> findByOrganizationIdAndId(UUID organizationId, UUID id);
}
