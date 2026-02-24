package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateAppointmentRequest;
import com.booking.entity.DTO.response.AppointmentResponse;
import com.booking.service.appoiment.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointment")
@RequiredArgsConstructor
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("create appointment request received, service = {}, start time = {}, end time = {}", request.getServiceId(), request.getStartTime(), request.getEndTime());

        AppointmentResponse response = appointmentService.createAppointment(request, user);

        log.info("create appointment successfully, appointment id = {}", response.getAppointmentId());

        return ResponseEntity.ok((response));
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> deleteAppointment(@PathVariable UUID appointmentId, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("delete appointment request received, appointment id = {}", appointmentId);

        AppointmentResponse response = appointmentService.deleteAppointment(appointmentId, user);

        log.info("delete appointment successfully, appointment id = {}", response.getAppointmentId());

        return ResponseEntity.ok(response);
    }
}
