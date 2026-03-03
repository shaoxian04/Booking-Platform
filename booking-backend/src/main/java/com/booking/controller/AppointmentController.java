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

import java.util.List;
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

    @GetMapping("/provider/unaccepted")
    public ResponseEntity<List<AppointmentResponse>> queryUnacceptAppointmentByProviderId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryUnacceptAppointmentByProviderId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/provider/accepted")
    public ResponseEntity<List<AppointmentResponse>> queryAcceptedAppointmentByProviderId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryAcceptedAppointmentByProviderId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/provider/completed")
    public ResponseEntity<List<AppointmentResponse>> queryCompletedAppointmentByProviderId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryCompletedAppointmentByProviderId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/provider/not-completed")
    public ResponseEntity<List<AppointmentResponse>> queryNotCompleteAppointmentByProviderId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryNotCompleteAppointmentByProviderId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/user/unaccepted")
    public ResponseEntity<List<AppointmentResponse>> queryUnacceptAppointmentByUserId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryUnacceptAppointmentByUserId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/user/accepted")
    public ResponseEntity<List<AppointmentResponse>> queryAcceptedAppointmentByUserId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryAcceptedAppointmentByUserId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/user/completed")
    public ResponseEntity<List<AppointmentResponse>> queryCompletedAppointmentByUserId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryCompletedAppointmentByUserId(userDetails.getUser().getUserId()));
    }

    @GetMapping("/user/not-completed")
    public ResponseEntity<List<AppointmentResponse>> queryNotCompletedAppointmentByUserId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.queryNotCompletedAppointmentByUserId(userDetails.getUser().getUserId()));
    }

    @PutMapping("/{appointmentId}/accept")
    public ResponseEntity<AppointmentResponse> acceptAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(appointmentService.acceptAppointment(appointmentId));
    }

    @PutMapping("/{appointmentId}/complete")
    public ResponseEntity<AppointmentResponse> completeAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(appointmentService.completeAppointment(appointmentId));
    }
}
