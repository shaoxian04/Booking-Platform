package com.booking.entity.DTO.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateAppointmentRequest {

    @NotNull(message = "service id required in appointment request")
    private UUID serviceId;

    @NotNull(message = "start time required in appointment request")
    private LocalDateTime startTime;

    @NotNull(message = "end time required in appointment request")
    private LocalDateTime endTime;

    private String remarks;
}
