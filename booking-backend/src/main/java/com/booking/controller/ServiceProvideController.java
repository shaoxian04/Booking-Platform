package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.request.ServiceUpdateRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.service.provider.ServiceProvideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceProvideController {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvideController.class);

    private final ServiceProvideService serviceProvideService;

    @PostMapping
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<CreateServiceResponse> createService(@RequestPart("data") @Valid CreateServiceRequest request,
                                                               @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                                               Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("create service request received, username = {}, service name = {}", user.getUsername(), request.getServiceName());

        CreateServiceResponse createServiceResponse = serviceProvideService.createService(request, images, user);

        log.info("create service successfully, provider id = {}, service name = {}", createServiceResponse.getProviderId(), createServiceResponse.getServiceName());

        return ResponseEntity.ok(createServiceResponse);
    }

    @GetMapping("/provider-all")
    public ResponseEntity<List<CreateServiceResponse>> getAllServices (Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("get all service for provider by user.username = {}", user.getUsername());

        List<CreateServiceResponse> serviceDos = serviceProvideService.getServicesByProvider(user);

        return ResponseEntity.ok(serviceDos);
    }

    @PutMapping("disabled/{serviceId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<CreateServiceResponse> disabledService(@PathVariable("serviceId") UUID serviceId) {

        log.info("disabledService request received, serviceId = {}", serviceId);

        CreateServiceResponse serviceDo = serviceProvideService.disableService(serviceId);

        return ResponseEntity.ok(serviceDo);
    }

    @PutMapping("/{serviceId}")
    @PreAuthorize("hasAuthority('PROVIDER')")
    public ResponseEntity<CreateServiceResponse> updateService(@RequestPart("data") @Valid ServiceUpdateRequest request,
                                                               @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                                               @PathVariable("serviceId") UUID serviceId) {

        log.info("updateService request received, serviceId = {}", serviceId);

        CreateServiceResponse response = serviceProvideService.updateService(request, images, serviceId);

        return ResponseEntity.ok(response);
    }

}
