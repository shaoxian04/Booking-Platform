package com.booking.entity.DTO.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateAppointmentRequest {
    private UUID serviceId;
    private UUID userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String remarks;
}
