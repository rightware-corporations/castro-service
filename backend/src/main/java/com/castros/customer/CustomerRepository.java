package com.castros.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CustomerRepository extends JpaRepository<Customer, UUID> { Optional<Customer> findFirstByOrganizationIdAndEmailIgnoreCase(UUID org, String email); Optional<Customer> findFirstByOrganizationIdAndPhone(UUID org, String phone); }
