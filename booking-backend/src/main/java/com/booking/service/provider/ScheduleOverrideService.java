package com.booking.service.provider;

import com.booking.entity.DO.ScheduleOverrideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateScheduleOverrideRequest;
import com.booking.entity.DTO.response.CreateScheduleOverrideResponse;
import com.booking.entity.DTO.response.QueryScheduleOverrideResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ScheduleOverrideService {

    CreateScheduleOverrideResponse createScheduleOverride(CreateScheduleOverrideRequest request, UserDO user);

    CreateScheduleOverrideResponse deleteScheduleOverride(UUID overrideId);

    List<ScheduleOverrideDO> findOverlappingOverridesByService(LocalDateTime startTime, LocalDateTime endTime, UUID providerId, UUID serviceId);

    List<QueryScheduleOverrideResponse> findOverlappingOverridesByService(LocalDateTime startTime, LocalDateTime endTime, UserDO user, UUID serviceId);

}
