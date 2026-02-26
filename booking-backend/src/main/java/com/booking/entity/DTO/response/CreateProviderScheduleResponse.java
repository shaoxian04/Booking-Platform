package com.booking.entity.DTO.response;

import com.booking.common.enums.DaysOfWeek;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class CreateProviderScheduleResponse {

    private DaysOfWeek daysOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;
}
