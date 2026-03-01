package com.booking.entity.DTO.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class ProviderUpdateRequest extends ProviderRegistrationRequest {

    private List<String> existingImages;
}
