package com.castros.request;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<RequestEntity, UUID> {
    Optional<RequestEntity> findByOrganizationIdAndIdempotencyKey(UUID organizationId, String idempotencyKey);
}
