package com.booking.entity.DTO.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ServiceUpdateRequest extends CreateServiceRequest{

    private List<String> existingImages;
}
