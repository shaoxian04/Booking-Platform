package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class QueryScheduleOverrideResponse {

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
