package com.booking.entity.DTO.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProviderRegistrationResponse {

    private UUID providerId;
    private String providerName;
    private String providerBio;
    private String profileImageUrl;
    private List<String> imagePath;
    private String availableTime;
    private String location;
    private Double averageRating;
    private Integer totalReviews;
}
