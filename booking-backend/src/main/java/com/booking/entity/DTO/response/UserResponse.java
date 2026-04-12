package com.booking.entity.DTO.response;

import com.booking.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID userId;
    private String username;
    private String email;
    private String phoneNo;
    private Role role;
    private String profileImageUrl;
    private LocalDateTime gmtCreate;
    private LocalDateTime gmtModified;
}
