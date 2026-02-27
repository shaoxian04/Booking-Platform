package com.booking.entity.DTO.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProviderRegistrationRequest {

    @NotBlank(message = "Service provider name required")
    private String providerName;

    private String providerBio;

    @NotBlank(message = "location required")
    private String location;

    @NotNull(message = "maxConcurrency required")
    private Integer maxConcurrency;

}
