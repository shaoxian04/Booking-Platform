package com.booking.controller;

import com.booking.entity.DTO.request.LoginRequest;
import com.booking.entity.DTO.request.RegisterRequest;
import com.booking.entity.DTO.response.JwtResponse;
import com.booking.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestPart("data") RegisterRequest request,
                                            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        authService.register(request, profileImage);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
