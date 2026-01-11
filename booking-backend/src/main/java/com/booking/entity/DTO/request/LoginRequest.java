package com.booking.entity.DTO.request;

import lombok.Data;

@Data
public class LoginRequest {

    private String usernameOrEmail;

    private String password;

}
