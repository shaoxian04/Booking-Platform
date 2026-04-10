package com.booking.controller;

import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.service.provider.ServiceProvideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/service")
@RequiredArgsConstructor
@Slf4j
public class PublicServiceController {

    private final ServiceProvideService serviceProvideService;

    @GetMapping("/{serviceId}")
    public ResponseEntity<CreateServiceResponse> getServiceById(@PathVariable UUID serviceId) {
        log.info("public getServiceById, serviceId = {}", serviceId);
        CreateServiceResponse response = serviceProvideService.getServiceById(serviceId);
        return ResponseEntity.ok(response);
    }
}
