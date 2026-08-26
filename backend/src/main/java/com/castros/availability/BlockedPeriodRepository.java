package com.castros.availability;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;
import java.util.*;

public interface BlockedPeriodRepository extends JpaRepository<BlockedPeriod, UUID> { List<BlockedPeriod> findByBookableTypeAndBookableIdAndStartAtLessThanAndEndAtGreaterThan(String type, UUID id, OffsetDateTime end, OffsetDateTime start); }
