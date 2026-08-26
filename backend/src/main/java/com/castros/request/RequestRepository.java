package com.castros.request;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RequestRepository extends JpaRepository<RequestEntity, UUID> { }
