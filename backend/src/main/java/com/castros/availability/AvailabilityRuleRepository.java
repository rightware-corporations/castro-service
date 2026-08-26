package com.castros.availability;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.*;

public interface AvailabilityRuleRepository extends JpaRepository<AvailabilityRule, UUID> { List<AvailabilityRule> findByBookableTypeAndBookableIdAndDayOfWeekAndActiveTrue(String type, UUID id, DayOfWeek day); }
