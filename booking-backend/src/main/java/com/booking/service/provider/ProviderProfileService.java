package com.booking.service.provider;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateProviderScheduleRequest;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.request.ProviderUpdateRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProviderProfileService {

    ProviderRegistrationResponse registerProvider (UserDO user, ProviderRegistrationRequest request, MultipartFile profileImage, List<MultipartFile> providerImages);

    ProviderRegistrationResponse createProviderSchedule(List<CreateProviderScheduleRequest> request, UUID userId);

    List<ProviderRegistrationResponse> queryProviderByName(String queryString);

    ProviderRegistrationResponse getProviderById(UUID providerId);

    ProviderRegistrationResponse updateProvider(ProviderUpdateRequest request, UUID userId, MultipartFile profileImage, List<MultipartFile> newImages);

    ProviderRegistrationResponse deleteProvider(UUID providerId);

    ProviderRegistrationResponse updateProviderSchedule(List<CreateProviderScheduleRequest> request, UUID userId);

    List<ProviderRegistrationResponse> queryByProviderNameOrServiceName(String queryName);
}
