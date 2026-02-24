package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CreateScheduleOverrideResponse {

    private UUID overrideId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private List<UUID> specificServices;
}
