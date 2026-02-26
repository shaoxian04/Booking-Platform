package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ProviderScheduleDO;
import com.booking.entity.DTO.request.CreateProviderScheduleRequest;
import com.booking.entity.DTO.response.CreateProviderScheduleResponse;
import org.springframework.stereotype.Component;

@Component
public class ProviderScheduleMapper {

    public ProviderScheduleDO toDO(CreateProviderScheduleRequest request, ProviderProfileDO provider) {
        return ProviderScheduleDO.builder()
                .provider(provider)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .dayOfWeek(request.getDayOfWeek())
                .build();
    }

    public CreateProviderScheduleResponse toResponse(ProviderScheduleDO schedule) {
        return CreateProviderScheduleResponse.builder()
                .daysOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .build();
    }
}
