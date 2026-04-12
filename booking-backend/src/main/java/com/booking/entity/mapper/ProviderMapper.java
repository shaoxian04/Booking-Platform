package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProviderMapper {

    public ProviderProfileDO toDO (UserDO user, ProviderRegistrationRequest request, String profileUrl, List<String> imageUrls){
        return ProviderProfileDO.builder()
                .providerName(request.getProviderName())
                .providerBio(request.getProviderBio())
                .imagePath(imageUrls)
                .profileImageUrl(profileUrl)
                .user(user)
                .location(request.getLocation())
                .maxConcurrency(request.getMaxConcurrency())
                .categories(request.getCategories() != null ? new ArrayList<>(request.getCategories()) : new ArrayList<>())
                .availableTime(request.getAvailableTime())
                .build();
    }

    public ProviderRegistrationResponse toResponse (ProviderProfileDO providerProfileDO){
        return ProviderRegistrationResponse.builder()
                .providerName(providerProfileDO.getProviderName())
                .providerId(providerProfileDO.getProviderId())
                .providerBio(providerProfileDO.getProviderBio())
                .imagePath(providerProfileDO.getImagePath())
                .profileImageUrl(providerProfileDO.getProfileImageUrl())
                .categories(providerProfileDO.getCategories() != null ? new ArrayList<>(providerProfileDO.getCategories()) : new ArrayList<>())
                .location(providerProfileDO.getLocation())
                .averageRating(providerProfileDO.getAverageRating())
                .totalReviews(providerProfileDO.getTotalReviews())
                .maxConcurrency(providerProfileDO.getMaxConcurrency())
                .availableTime(providerProfileDO.getAvailableTime())
                .isCompleted(providerProfileDO.getIsCompleted())
                .build();
    }

}
