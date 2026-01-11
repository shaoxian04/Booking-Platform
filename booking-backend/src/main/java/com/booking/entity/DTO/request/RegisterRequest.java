package com.booking.entity.DTO.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String phoneNo;
    private String role;
}
