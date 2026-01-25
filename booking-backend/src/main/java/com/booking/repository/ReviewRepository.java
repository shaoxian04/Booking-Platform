package com.booking.repository;

import com.booking.entity.DO.ReviewDO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<ReviewDO, UUID> {
    Optional<ReviewDO> findByProvider_ProviderId(UUID providerId);
}
