package com.booking.entity.DTO.response;

import lombok.Data;

import java.util.UUID;

@Data
public class AppointmentResponse {
    private String token;
    private String type;
    private UUID id;
    private String username;
    private String email;
    private String role;
}
