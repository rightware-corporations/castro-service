package com.castros.availability;

import com.castros.booking.BookableType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityExceptionEntity, UUID> {
    List<AvailabilityExceptionEntity> findByBookableTypeAndBookableIdAndDate(BookableType type, UUID id, LocalDate date);
    List<AvailabilityExceptionEntity> findAllByOrganizationIdOrderByDateDesc(UUID organizationId);
    Optional<AvailabilityExceptionEntity> findByOrganizationIdAndId(UUID organizationId, UUID id);
}
