package com.booking.entity.DTO.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateServiceRequest {
    private UUID providerId;
    private String serviceName;
    private String serviceBio;
    private Integer duration;
    private BigDecimal price;
    private String imagePath;
}
