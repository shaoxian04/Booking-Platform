package com.booking.repository;

import com.booking.entity.DO.ServiceProvideDO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ServiceProvideRepository extends JpaRepository<ServiceProvideDO, UUID> {
    Optional<ServiceProvideDO> findByProvider_ProviderId(UUID providerId);
}
