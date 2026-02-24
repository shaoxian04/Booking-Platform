package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ScheduleOverrideDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DTO.request.CreateScheduleOverrideRequest;
import com.booking.entity.DTO.response.CreateScheduleOverrideResponse;
import com.booking.entity.DTO.response.QueryScheduleOverrideResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ScheduleOverrideMapper {

    public ScheduleOverrideDO toDO(CreateScheduleOverrideRequest request, ProviderProfileDO provider, List<ServiceProvideDO> specificServices) {
        return ScheduleOverrideDO.builder()
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .provider(provider)
                .remarks(request.getRemarks())
                .specificServices(specificServices)
                .build();
    }

    public CreateScheduleOverrideResponse toResponse(ScheduleOverrideDO scheduleOverrideDO, List<UUID> specificServices) {
        return CreateScheduleOverrideResponse.builder()
                .overrideId(scheduleOverrideDO.getId())
                .startTime(scheduleOverrideDO.getStartTime())
                .endTime(scheduleOverrideDO.getEndTime())
                .specificServices(specificServices)
                .build();
    }

    public CreateScheduleOverrideResponse toDeleteResponse(ScheduleOverrideDO scheduleOverrideDO) {
        return CreateScheduleOverrideResponse.builder()
                .overrideId(scheduleOverrideDO.getId())
                .startTime(scheduleOverrideDO.getStartTime())
                .endTime(scheduleOverrideDO.getEndTime())
                .build();
    }

    public QueryScheduleOverrideResponse toQueryResponse(ScheduleOverrideDO scheduleOverrideDO) {
        return QueryScheduleOverrideResponse.builder()
                .startTime(scheduleOverrideDO.getStartTime())
                .endTime(scheduleOverrideDO.getEndTime())
                .build();
    }
}
