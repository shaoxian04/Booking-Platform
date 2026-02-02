package com.booking.controller;

import com.booking.common.security.CustomUserDetails;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import com.booking.service.provider.ProviderRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/provider")
@RequiredArgsConstructor
public class ProfileProviderController {

    private final ProviderRegistrationService providerRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<ProviderRegistrationResponse> registerAsProvider(@Valid @RequestPart("data") ProviderRegistrationRequest request,
                                                     @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
                                                     @RequestPart(value = "shopImages", required = false) List<MultipartFile> providerImages,
                                                     Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        ProviderRegistrationResponse response = providerRegistrationService.registerProvider(user, request, profileImage, providerImages);

        return ResponseEntity.ok(response);
    }
}
