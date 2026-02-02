package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProviderMapper {

    public ProviderProfileDO toDO (UserDO user, ProviderRegistrationRequest request, String profileUrl, List<String> imageUrls){
        return ProviderProfileDO.builder()
                .providerName(request.getProviderName())
                .providerBio(request.getProviderBio())
                .availableTime(request.getAvailableTime())
                .imagePath(imageUrls)
                .profileImageUrl(profileUrl)
                .user(user)
                .location(request.getLocation())
                .extInfo(request.getExtInfo())
                .build();
    }

    public ProviderRegistrationResponse toResponse (ProviderProfileDO providerProfileDO){
        return ProviderRegistrationResponse.builder()
                .providerId(providerProfileDO.getProviderId())
                .providerBio(providerProfileDO.getProviderBio())
                .imagePath(providerProfileDO.getImagePath())
                .profileImageUrl(providerProfileDO.getProfileImageUrl())
                .availableTime(providerProfileDO.getAvailableTime())
                .location(providerProfileDO.getLocation())
                .averageRating(providerProfileDO.getAverageRating())
                .totalReviews(providerProfileDO.getTotalReviews())
                .build();
    }

}
