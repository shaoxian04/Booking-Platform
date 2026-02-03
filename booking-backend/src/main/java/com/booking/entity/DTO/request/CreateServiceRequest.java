package com.booking.entity.DTO.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateServiceRequest {

    @NotBlank(message = "Service name required")
    private String serviceName;

    private String serviceBio;

    private String remarks;

    @NotNull(message = "Duration of service required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer duration;

    @NotNull(message = "Price of service required")
    @Min(value = 0, message = "Price must greater or equal to 0")
    private BigDecimal price;

}
