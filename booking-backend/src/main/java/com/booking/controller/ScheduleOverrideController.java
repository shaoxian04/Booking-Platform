package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateScheduleOverrideRequest;
import com.booking.entity.DTO.response.CreateScheduleOverrideResponse;
import com.booking.entity.DTO.response.QueryScheduleOverrideResponse;
import com.booking.service.provider.ScheduleOverrideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Slf4j
@RestController
@RequestMapping("/api/override")
public class ScheduleOverrideController {

    private final ScheduleOverrideService scheduleOverrideService;

    @PostMapping("/")
    public ResponseEntity<CreateScheduleOverrideResponse> createScheduleOverride(@Valid @RequestBody CreateScheduleOverrideRequest request, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("create schedule override request received, startTime = {}, endTime = {}, userId = {}", request.getStartTime(), request.getEndTime(), user.getUserId());

        CreateScheduleOverrideResponse response = scheduleOverrideService.createScheduleOverride(request, user);

        log.info("create schedule override successfully, overrideId = {}", response.getOverrideId());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{overrideId}")
    public ResponseEntity<CreateScheduleOverrideResponse> deleteScheduleOverride(@PathVariable UUID overrideId, Authentication authentication) {

        log.info("delete schedule override request received, overrideId = {}", overrideId);

        CreateScheduleOverrideResponse response = scheduleOverrideService.deleteScheduleOverride(overrideId);

        log.info("delete schedule override successfully, overrideId = {}", response.getOverrideId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<List<QueryScheduleOverrideResponse>> queryScheduleOverrideForService(@RequestParam UUID serviceId,
                                                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
                                                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
                                                                                         Authentication authentication){

        log.info("query schedule override request received, serviceId = {}", serviceId);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        List<QueryScheduleOverrideResponse> responses = scheduleOverrideService.findOverlappingOverridesByService(startTime, endTime, user, serviceId);

        log.info("query schedule override successfully");

        return ResponseEntity.ok(responses);
    }

}
