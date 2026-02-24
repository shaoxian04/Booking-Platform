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
    Optional<AppointmentDO> findByUser_UserId(UUID userId);

    @Query("SELECT a FROM AppointmentDO a WHERE a.provider.providerId = :providerId")
    List<AppointmentDO> findByProvider_ProviderId(@Param("providerId") UUID providerId);

    @Query("SELECT a FROM AppointmentDO a " +
            "WHERE a.provider.providerId = :providerId " +
            "AND ((a.startTime < :endTime) AND (a.endTime > :startTime))")
    List<AppointmentDO> findOverlappingAppointmentsForProvider(
            @Param("providerId") UUID providerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT COUNT(a) FROM AppointmentDO a WHERE a.provider.id = :id " +
            "AND ((a.startTime < :end) AND (a.endTime > :start))")
    int countOverlappingAppointments(@Param("id") UUID id, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT a FROM AppointmentDO a " +
            "WHERE a.provider.providerId = :providerId " +
            "AND a.startTime < :endTime AND a.endTime > :startTime")
    List<AppointmentDO> findConflictingAppointmentsByProvider(
            @Param("providerId") UUID providerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT a FROM AppointmentDO a " +
            "WHERE a.provider.providerId = :providerId " +
            "AND a.startTime < :endTime AND a.endTime > :startTime " +
            "AND a.service.serviceId IN :serviceIds")
    List<AppointmentDO> findConflictingAppointmentsByServices(
            @Param("providerId") UUID providerId,
            @Param("serviceIds") List<UUID> serviceIds,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

}
