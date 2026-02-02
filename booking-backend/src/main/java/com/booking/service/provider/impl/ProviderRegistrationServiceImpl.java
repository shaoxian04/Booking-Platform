package com.booking.service.provider.impl;

import com.booking.common.enums.Role;
import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import com.booking.entity.mapper.ProviderMapper;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.UserRepository;
import com.booking.service.provider.ProviderRegistrationService;
import com.booking.service.storage.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Validated
public class ProviderRegistrationServiceImpl implements ProviderRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(ProviderRegistrationServiceImpl.class);

    private static final String PROFILE_IMAGE_BUCKET = "provider_profile_image";

    private static final String PROVIDER_IMAGES = "provider_images";

    private final ProviderProfileRepository providerProfileRepository;

    private final UserRepository userRepository;

    private final SupabaseStorageService supabaseStorageService;

    private final ProviderMapper providerMapper;

    @Override
    @Transactional
    public ProviderRegistrationResponse registerProvider(UserDO user, ProviderRegistrationRequest request, MultipartFile profileImage, List<MultipartFile> providerImages) {

        log.info("Provider registration start, username = {}, provider name = {}", user.getUsername(), request.getProviderName());

        providerPreCheck(user, request);

        String profileUrl = "";
        if (profileImage != null && !profileImage.isEmpty()) {
            profileUrl = supabaseStorageService.uploadFile(profileImage, PROFILE_IMAGE_BUCKET);
        }

        List<String> imageUrls = Optional.ofNullable(providerImages)
                .orElse(Collections.emptyList())
                .stream()
                .filter(img -> !img.isEmpty())
                .map(img -> supabaseStorageService.uploadFile(img, PROVIDER_IMAGES))
                .toList();

        ProviderProfileDO providerDO = providerMapper.toDO(user, request, profileUrl, imageUrls);

        providerProfileRepository.save(providerDO);

        updateUserRole(user);

        log.info("Provider registered successfully");

        return providerMapper.toResponse(providerDO);
    }

    private void providerPreCheck(UserDO user, ProviderRegistrationRequest request) {
        AssertUtil.isTrue(!providerProfileRepository.existsByUser_UserId(user.getUserId()), new AlreadyExistedException("The user already registered as provider"));

        AssertUtil.isTrue(!providerProfileRepository.existsByProviderNameIgnoreCase(request.getProviderName()), new AlreadyExistedException("The provider name existed"));
    }

    private void updateUserRole(UserDO user) {
        user.setRole(Role.PROVIDER);
        userRepository.save(user);
    }
}
