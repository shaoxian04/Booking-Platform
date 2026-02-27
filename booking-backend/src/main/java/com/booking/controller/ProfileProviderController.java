package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateProviderScheduleRequest;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import com.booking.service.provider.ProviderProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
@Slf4j
public class ProfileProviderController {

    private final ProviderProfileService providerService;

    @PostMapping("/register")
    public ResponseEntity<ProviderRegistrationResponse> registerAsProvider(@Valid @RequestPart("data") ProviderRegistrationRequest request,
                                                                           @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
                                                                           @RequestPart(value = "shopImages", required = false) List<MultipartFile> providerImages,
                                                                           Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("register provider request received, userId = {}", user.getUserId());

        ProviderRegistrationResponse response = providerService.registerProvider(user, request, profileImage, providerImages);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderRegistrationResponse> updateProvider(@Valid @RequestPart("data") ProviderRegistrationRequest request,
                                                                       @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
                                                                       @RequestPart(value = "providerImages", required = false) List<MultipartFile> providerImages,
                                                                       Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("update provider request received, userId = {}", user.getUserId());

        ProviderRegistrationResponse response = providerService.updateProvider(request, user.getUserId(), profileImage, providerImages);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{providerId}")
    public ResponseEntity<ProviderRegistrationResponse> getProviderById(@PathVariable UUID providerId) {

        log.info("get provider by id, providerId = {}", providerId);

        ProviderRegistrationResponse response = providerService.getProviderById(providerId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<List<ProviderRegistrationResponse>> queryProviderByName(@RequestParam String providerName) {

        log.info("query provider by name, providerName = {}", providerName);

        List<ProviderRegistrationResponse> responses = providerService.queryProviderByName(providerName);

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderRegistrationResponse> createProviderSchedule(@RequestBody List<CreateProviderScheduleRequest> request, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("create provider schedule request received, userId = {}", user.getUserId());

        ProviderRegistrationResponse response = providerService.createProviderSchedule(request, user.getUserId());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/schedule")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<ProviderRegistrationResponse> updateProviderSchedule(@RequestBody List<CreateProviderScheduleRequest> request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("update provider schedule request received, userId = {}", user.getUserId());

        ProviderRegistrationResponse response = providerService.updateProviderSchedule(request, user.getUserId());

        return ResponseEntity.ok(response);
    }
}
