package com.booking.common.exception;

import com.booking.common.security.ApiError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        return new ResponseEntity<>(ApiError.maxSizeUpload(), HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(MethodArgumentNotValidException ex) {
        log.warn("Exception caught",ex);

        // 1. Get all validation error messages (e.g., "Email is required", "Password too short")
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.toList());

        return new ResponseEntity<>(ApiError.badRequest(errors), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Exception caught",ex);

        return new ResponseEntity<>(ApiError.badCredentials(ex), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AlreadyExistedException.class)
    public ResponseEntity<ApiError> handleAlreadyExistedException (AlreadyExistedException ex) {
        log.warn("Exception caught",ex);

        return new ResponseEntity<>(ApiError.conflictRequest(ex), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntimeException(RuntimeException ex) {
        log.warn("Exception caught",ex);

       return new ResponseEntity<>(ApiError.badRequest(ex), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Exception caught",ex);

        return new ResponseEntity<>(ApiError.internalServerError(ex), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
