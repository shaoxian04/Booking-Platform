package com.booking.repository;

import com.booking.entity.DO.ServiceProvideDO;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ServiceProvideRepository extends JpaRepository<ServiceProvideDO, UUID> {

    @Query("SELECT s FROM ServiceProvideDO s WHERE s.provider.providerId = :providerId AND s.published = TRUE")
    List<ServiceProvideDO> findByProviderId(@Param("providerId") UUID providerId);

    boolean existsByProvider_ProviderIdAndServiceNameIgnoreCase(UUID providerId, String serviceName);

}
