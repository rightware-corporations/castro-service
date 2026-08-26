package com.castros.availability;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityExceptionEntity, UUID> { List<AvailabilityExceptionEntity> findByBookableTypeAndBookableIdAndDate(String type, UUID id, LocalDate date); }
