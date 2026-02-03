package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CreateServiceResponse {

    private UUID serviceId;
    private UUID providerId;
    private String serviceName;
    private String serviceBio;
    private Integer duration;
    private BigDecimal price;
    private List<String> imagePath;
    private LocalDateTime gmtCreate;
    private String remarks;
}
