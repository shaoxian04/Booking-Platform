package com.booking.common.security;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiError {
    private int status;
    private List<String> errorMsg;
    private LocalDateTime timestamp;

    public static ApiError badCredentials(Exception ex) {
        return new ApiError(HttpStatus.UNAUTHORIZED.value(), List.of("Invalid username or password"), LocalDateTime.now());
    }

    public static ApiError conflictRequest(Exception ex) {
        return new ApiError(HttpStatus.CONFLICT.value(), List.of(ex.getMessage()), LocalDateTime.now());
    }

    public static ApiError badRequest(Exception ex) {
        return new ApiError(HttpStatus.BAD_REQUEST.value(), List.of(ex.getMessage()), LocalDateTime.now());
    }

    public static ApiError badRequest(List<String> msg) {
        return new ApiError(HttpStatus.BAD_REQUEST.value(), msg, LocalDateTime.now());
    }

    public static ApiError internalServerError(Exception ex) {
        return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR.value(), List.of(ex.getMessage()), LocalDateTime.now());
    }
}
