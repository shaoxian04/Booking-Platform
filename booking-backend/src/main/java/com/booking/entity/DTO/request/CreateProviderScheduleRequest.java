package com.booking.entity.DTO.request;

import com.booking.common.enums.DaysOfWeek;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateProviderScheduleRequest {

    @NotNull(message = "The day of week cannot be null in createProviderScheduleRequest")
    private DaysOfWeek dayOfWeek;

    @NotNull(message = "Start time cannot be null in createProviderScheduleRequest")
    private LocalTime startTime;

    @NotNull(message = "Start time cannot be null in createProviderScheduleRequest")
    private LocalTime endTime;
}
