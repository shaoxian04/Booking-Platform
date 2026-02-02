package com.booking.entity.DTO.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProviderRegistrationRequest {

    @NotBlank(message = "Service provider name required")
    private String providerName;

    private String providerBio;

    @NotBlank(message = "availableTime required")
    private String availableTime;

    @NotBlank(message = "location required")
    private String location;

    private String extInfo;
}
