package com.booking.repository;

import com.booking.entity.DO.ProviderProfileDO;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfileDO, UUID> {
    boolean existsByUser_UserId(UUID userId);

    boolean existsByProviderNameIgnoreCase(String providerName);

    Optional<ProviderProfileDO> findByUser_UserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProviderProfileDO p WHERE p.providerId = :id")
    Optional<ProviderProfileDO> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT p FROM ProviderProfileDO p WHERE LOWER(p.providerName) LIKE CONCAT('%', LOWER(:providerName), '%')")
    List<ProviderProfileDO> findByProviderName(@Param("providerName") String providerName);

    @Query("SELECT DISTINCT p FROM ProviderProfileDO p " +
            "LEFT JOIN p.providedServices s " +
            "WHERE LOWER(p.providerName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR (LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) AND s.published = TRUE)")
    List<ProviderProfileDO> findByProviderOrService(@Param("keyword") String keyword);
}
