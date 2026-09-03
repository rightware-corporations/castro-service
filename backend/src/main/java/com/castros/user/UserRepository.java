package com.castros.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);

    @Query(value = """
        select distinct p.code
        from organization_members om
        join role_permissions rp on rp.role_id = om.role_id
        join permissions p on p.id = rp.permission_id
        where om.user_id = :userId and om.organization_id = :organizationId
        order by p.code
        """, nativeQuery = true)
    List<String> findPermissionCodes(@Param("userId") UUID userId, @Param("organizationId") UUID organizationId);

    @Query(value = """
        select om.experience_type
        from organization_members om
        where om.user_id = :userId and om.organization_id = :organizationId
        """, nativeQuery = true)
    Optional<String> findExperienceType(@Param("userId") UUID userId, @Param("organizationId") UUID organizationId);
}
