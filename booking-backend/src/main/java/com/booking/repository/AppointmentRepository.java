package com.booking.repository;

import com.booking.entity.DO.AppointmentDO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<AppointmentDO, UUID> {
    Optional<AppointmentDO> findByUserId(UUID userId);

    @Query("SELECT a FROM Appointment a WHERE a.service.provider.id = :providerId")
    List<AppointmentDO> findByProviderId(@Param("providerId") UUID providerId);

    @Query("SELECT a FROM Appointment a " +
            "WHERE a.service.provider.id = :providerId " +
            "AND ((a.startTime < :endTime) AND (a.endTime > :startTime))")
    List<AppointmentDO> findOverlappingAppointmentsForProvider(
            @Param("providerId") UUID providerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

}
