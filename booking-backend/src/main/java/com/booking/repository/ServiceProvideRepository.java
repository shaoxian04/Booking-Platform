package com.booking.repository;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ServiceProvideRepository extends JpaRepository<ServiceProvideDO, UUID> {
    List<ServiceProvideDO> findByProvider_ProviderId(UUID providerId);

    boolean existsByProvider_ProviderIdAndServiceNameIgnoreCase(UUID providerId, String serviceName);
}
