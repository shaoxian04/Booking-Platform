package com.booking.service.provider;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ProviderRegistrationService {

    ProviderRegistrationResponse registerProvider (UserDO user, ProviderRegistrationRequest request, MultipartFile profileImage, List<MultipartFile> providerImages);
}
