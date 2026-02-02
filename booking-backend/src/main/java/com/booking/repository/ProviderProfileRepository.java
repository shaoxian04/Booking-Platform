package com.booking.repository;

import com.booking.entity.DO.ProviderProfileDO;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfileDO, UUID> {
    boolean existsByUser_UserId(UUID userId);

    boolean existsByProviderNameIgnoreCase(String providerName);

    Optional<ProviderProfileDO> findByUser_UserId(UUID userId);
}
