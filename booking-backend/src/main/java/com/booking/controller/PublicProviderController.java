package com.booking.controller;

import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import com.booking.service.provider.ProviderProfileService;
import com.booking.service.provider.ServiceProvideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/provider")
@RequiredArgsConstructor
@Slf4j
public class PublicProviderController {

    private final ServiceProvideService serviceProvideService;
    private final ProviderProfileService providerProfileService;

    @GetMapping("/{providerId}/services")
    public ResponseEntity<List<CreateServiceResponse>> getServicesByProvider(@PathVariable UUID providerId) {

        log.info("public getServicesByProvider, providerId = {}", providerId);

        List<CreateServiceResponse> services = serviceProvideService.getServicesByProviderId(providerId);

        return ResponseEntity.ok(services);
    }

    @GetMapping("/{providerId}")
    public ResponseEntity<ProviderRegistrationResponse> getProviderById(@PathVariable UUID providerId) {

        log.info("public getProviderById, providerId = {}", providerId);

        ProviderRegistrationResponse response = providerProfileService.getProviderById(providerId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProviderRegistrationResponse>> searchProviders(@RequestParam String queryName) {

        log.info("public searchProviders, queryName = {}", queryName);

        List<ProviderRegistrationResponse> responses = providerProfileService.queryByProviderNameOrServiceName(queryName);

        return ResponseEntity.ok(responses);
    }
}
