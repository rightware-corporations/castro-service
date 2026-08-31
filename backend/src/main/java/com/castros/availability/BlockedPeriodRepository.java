package com.castros.availability;

import com.castros.booking.BookableType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;
import java.util.*;

public interface BlockedPeriodRepository extends JpaRepository<BlockedPeriod, UUID> {
    List<BlockedPeriod> findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(BookableType type, UUID id, OffsetDateTime end, OffsetDateTime start);
    List<BlockedPeriod> findAllByOrganizationIdOrderByStartAtDesc(UUID organizationId);
    Optional<BlockedPeriod> findByOrganizationIdAndId(UUID organizationId, UUID id);
}
