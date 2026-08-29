package com.castros.request;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface RequestRepository extends JpaRepository<RequestEntity, UUID> {
    Optional<RequestEntity> findByOrganizationIdAndIdempotencyKey(UUID organizationId, String idempotencyKey);
    Optional<RequestEntity> findByOrganizationIdAndId(UUID organizationId, UUID id);
    List<RequestEntity> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
