package com.castros.booking;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.*;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("select b from Booking b where b.bookableType=:type and b.bookableId=:id and b.status in :statuses and b.startAt < :endAt and b.endAt > :startAt")
    List<Booking> findOverlaps(@Param("type") BookableType type,@Param("id") UUID id,@Param("statuses") Collection<BookingStatus> statuses,@Param("startAt") OffsetDateTime startAt,@Param("endAt") OffsetDateTime endAt);
    Optional<Booking> findByReference(String reference);
    Optional<Booking> findByOrganizationIdAndIdempotencyKey(UUID organizationId, String idempotencyKey);
}
