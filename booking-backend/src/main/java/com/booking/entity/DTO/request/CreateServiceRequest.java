package com.booking.entity.DTO.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateServiceRequest {

    @NotBlank(message = "Provider Id required in service creation")
    private UUID providerId;

    @NotBlank(message = "Service name required")
    private String serviceName;

    private String serviceBio;

    @NotBlank(message = "Duration of service required")
    private Integer duration;

    @NotBlank(message = "Price of service required")
    private BigDecimal price;

    private String imagePath;
}
