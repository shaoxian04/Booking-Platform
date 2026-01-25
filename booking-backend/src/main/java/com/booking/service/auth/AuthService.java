package com.booking.service.auth;

import com.booking.common.result.RequestResult;
import com.booking.entity.DTO.request.LoginRequest;
import com.booking.entity.DTO.request.RegisterRequest;
import com.booking.entity.DTO.response.JwtResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface AuthService {

    void register(RegisterRequest request);

    JwtResponse login(LoginRequest request);
}
