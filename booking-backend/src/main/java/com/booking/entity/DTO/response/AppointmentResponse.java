package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AppointmentResponse {
    private UUID appointmentId;
    private UUID serviceId;
    private UUID userId;
    private LocalDateTime gmtCreate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String remarks;
}
