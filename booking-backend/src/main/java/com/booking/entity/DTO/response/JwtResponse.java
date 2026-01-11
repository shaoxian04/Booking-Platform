package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class JwtResponse {
    private String token;
    private String type;
    private UUID id;
    private String username;
    private String email;
    private String role;
}
