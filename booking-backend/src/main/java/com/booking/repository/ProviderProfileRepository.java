package com.booking.repository;

import com.booking.entity.DO.ProviderProfileDO;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfileDO, UUID> {
    Optional<ProviderProfileDO> findByUserId (UUID userId);

    @Query("SELECT p FROM ProviderProfileDO p WHERE LOWER (p.providerName) LIKE LOWER(CONCAT('%',:providerName,'%'))")
    List<ProviderProfileDO> findByProviderName(@Param("providerName") String providerName);
}
