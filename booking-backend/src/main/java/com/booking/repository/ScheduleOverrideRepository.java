package com.booking.repository;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ScheduleOverrideDO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ScheduleOverrideRepository extends JpaRepository<ScheduleOverrideDO, UUID> {

    @Query("SELECT s FROM ScheduleOverrideDO s " +
            "LEFT JOIN FETCH s.specificServices " +
            "WHERE s.provider.providerId = :providerId " +
            "AND ((s.startTime < :endTime) AND (s.endTime > :startTime))")
    List<ScheduleOverrideDO> findOverlappingByProvider(@Param("providerId") UUID providerId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);

    @Query("SELECT DISTINCT o FROM ScheduleOverrideDO o " +
            "LEFT JOIN o.specificServices s " +
            "WHERE o.provider.providerId = :providerId " + // 1. Lock to this provider
            "AND (o.startTime < :endTime AND o.endTime > :startTime) " + // 2. Check overlap
            "AND (s.serviceId = :serviceId OR o.specificServices IS EMPTY)") // 3. Specific OR All
    List<ScheduleOverrideDO> findOverlappingOverridesByService(
            @Param("providerId") UUID providerId,
            @Param("serviceId") UUID serviceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

}
