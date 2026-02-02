package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.service.provider.ServiceProvideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceProvideController {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvideController.class);

    private final ServiceProvideService serviceProvideService;

    @PostMapping
    public ResponseEntity<ServiceProvideDO> createService(@RequestBody @Valid CreateServiceRequest request, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("create service request received, username = {}, service name = {}", user.getUsername(), request.getServiceName());

        ServiceProvideDO serviceDO = serviceProvideService.createService(request, user);

        log.info("create service successfully, provider name = {}, service name = {}", serviceDO.getProvider().getProviderName(), serviceDO.getServiceName());

        return ResponseEntity.ok(serviceDO);
    }

    @GetMapping("/get-services")
    public ResponseEntity<List<ServiceProvideDO>> getAllServices (Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("get all service for provider by user.username = {}", user.getUsername());

        List<ServiceProvideDO> serviceDos = serviceProvideService.getServicesByProvider(user);

        return ResponseEntity.ok(serviceDos);
    }
}
