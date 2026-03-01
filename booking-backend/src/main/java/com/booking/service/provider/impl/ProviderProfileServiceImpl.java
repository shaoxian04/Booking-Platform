package com.booking.service.provider.impl;

import com.booking.common.enums.Role;
import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.exception.NotFoundException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ProviderScheduleDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateProviderScheduleRequest;
import com.booking.entity.DTO.request.ProviderRegistrationRequest;
import com.booking.entity.DTO.request.ProviderUpdateRequest;
import com.booking.entity.DTO.response.ProviderRegistrationResponse;
import com.booking.entity.mapper.ProviderMapper;
import com.booking.entity.mapper.ProviderScheduleMapper;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.UserRepository;
import com.booking.service.provider.ProviderProfileService;
import com.booking.service.storage.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Validated
public class ProviderProfileServiceImpl implements ProviderProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProviderProfileServiceImpl.class);

    private static final String PROFILE_IMAGE_BUCKET = "provider_profile_image";

    private static final String PROVIDER_IMAGES = "provider_images";

    private final ProviderProfileRepository providerProfileRepository;

    private final UserRepository userRepository;

    private final SupabaseStorageService supabaseStorageService;

    private final ProviderMapper providerMapper;

    private final ProviderScheduleMapper providerScheduleMapper;

    @Override
    @Transactional
    public ProviderRegistrationResponse registerProvider(UserDO user, ProviderRegistrationRequest request, MultipartFile profileImage, List<MultipartFile> providerImages) {

        log.info("Provider registration start, username = {}, provider name = {}", user.getUsername(), request.getProviderName());

        AssertUtil.isTrue(!providerProfileRepository.existsByUser_UserId(user.getUserId()), new AlreadyExistedException("The user already registered as provider"));

        AssertUtil.isTrue(!providerProfileRepository.existsByProviderNameIgnoreCase(request.getProviderName()), new AlreadyExistedException("The provider name existed"));

        String profileUrl = uploadProviderProfileImage(profileImage);

        List<String> imageUrls = uploadProviderImages(providerImages);

        ProviderProfileDO providerDO = providerMapper.toDO(user, request, profileUrl, imageUrls);

        ProviderProfileDO newProvider = providerProfileRepository.save(providerDO);

        updateUserRole(user);

        log.info("Provider registered successfully");

        return providerMapper.toResponse(newProvider);
    }

    @Override
    @Transactional
    public ProviderRegistrationResponse createProviderSchedule(List<CreateProviderScheduleRequest> request, UUID userId) {

        log.info("createProviderSchedule start, user_id = {}", userId);

        ProviderProfileDO providerDo = providerProfileRepository.findByUser_UserId(userId)
                .orElseThrow(() ->new NotFoundException("The provider is not found"));

        List<ProviderScheduleDO> scheduleDOS = request.stream()
                .map(s -> providerScheduleMapper.toDO(s, providerDo))
                .toList();

        providerDo.getSchedules().clear();
        providerDo.getSchedules().addAll(scheduleDOS);

        providerDo.setIsCompleted(true);

        ProviderProfileDO updatedProvider = providerProfileRepository.save(providerDo);

        log.info("createProviderSchedule success, userId = {}, providerId = {}, number of schedule = {}", userId, updatedProvider.getProviderId(), scheduleDOS.size());

        return providerMapper.toResponse(updatedProvider);
    }

    @Override
    public List<ProviderRegistrationResponse> queryProviderByName(String queryString) {

        log.info("queryProviderByName, name = {}", queryString);

        List<ProviderProfileDO> providerDos = providerProfileRepository.findByProviderName(queryString);

        log.info("queryProviderByName success, number of result = {}", providerDos.size());

        return providerDos.stream()
                .map(providerMapper::toResponse)
                .toList();

    }

    @Override
    public ProviderRegistrationResponse getProviderById(UUID providerId) {

        log.info("getProviderById, providerId = {}", providerId);

        ProviderProfileDO providerDo = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new NotFoundException("Provider not found"));

        return providerMapper.toResponse(providerDo);
    }

    @Override
    @Transactional
    public ProviderRegistrationResponse updateProvider(ProviderUpdateRequest request, UUID userId, MultipartFile profileImage, List<MultipartFile> newImages) {

        log.info("updateProvider, userId = {}", userId);

        ProviderProfileDO providerDo = providerProfileRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException("Provider not found"));

        if (profileImage != null) {
            providerDo.setProfileImageUrl(uploadProviderProfileImage(profileImage));
        }

        List<String> finalImagesPath = new ArrayList<>();

        List<String> existingImages = request.getExistingImages();

        if(!existingImages.isEmpty()) {
            finalImagesPath.addAll(existingImages);
        }

        if (newImages != null && !newImages.isEmpty()) {
            List<String> newProviderImages = uploadProviderImages(newImages);

            log.info("newImages in request = {}, newImages uploaded = {}", newImages.size(), newProviderImages.size());

            AssertUtil.isTrue(newProviderImages.size() == newImages.size(), new RuntimeException("some providerImages upload failed"));

            finalImagesPath.addAll(newProviderImages);
        }

        providerDo.getImagePath().clear();
        providerDo.setImagePath(finalImagesPath);

        fillUpdateProvider(request, providerDo);

        ProviderProfileDO updateProviderDo = providerProfileRepository.save(providerDo);

        log.info("update provider successfully, userId = {}, providerId = {}", userId, updateProviderDo.getProviderId());

        return providerMapper.toResponse(updateProviderDo);
    }

    @Override
    @Transactional
    public ProviderRegistrationResponse deleteProvider(UUID providerId) {

        log.info("deleteProvider, providerId = {}", providerId);

        ProviderProfileDO providerDo = providerProfileRepository.findById(providerId)
                .orElseThrow(() ->new NotFoundException("provider not found"));

        providerProfileRepository.deleteById(providerId);

        return providerMapper.toResponse(providerDo);
    }

    @Override
    public ProviderRegistrationResponse updateProviderSchedule(List<CreateProviderScheduleRequest> request, UUID userId) {

        log.info("updateProviderSchedule start, user_id = {}", userId);

        ProviderProfileDO providerDo = providerProfileRepository.findByUser_UserId(userId)
                .orElseThrow(() ->new NotFoundException("The provider is not found"));

        List<ProviderScheduleDO> newScheduleDos = request.stream()
                .map(s -> providerScheduleMapper.toDO(s, providerDo))
                .toList();

        List<ProviderScheduleDO> currentSchedule = Optional.ofNullable(providerDo.getSchedules())
                .orElseGet(ArrayList::new);

        currentSchedule.clear();
        currentSchedule.addAll(newScheduleDos);

        providerDo.setSchedules(currentSchedule);

        ProviderProfileDO updateProviderDo = providerProfileRepository.save(providerDo);

        return providerMapper.toResponse(updateProviderDo);
    }

    @Override
    public List<ProviderRegistrationResponse> queryByProviderNameOrServiceName(String queryName) {
        log.info("queryByProviderNameOrServiceName, queryName = {}", queryName);

        List<ProviderProfileDO> providerDos = providerProfileRepository.findByProviderOrService(queryName);

        log.info("queryByProviderNameOrServiceName, result size = {}", providerDos.size());

        return providerDos.stream()
                .map(providerMapper::toResponse)
                .toList();
    }


    private void updateUserRole(UserDO user) {
        user.setRole(Role.PROVIDER);
        userRepository.save(user);
    }

    private String uploadProviderProfileImage(MultipartFile profileImage) {
        if (profileImage != null && !profileImage.isEmpty()) {
            return supabaseStorageService.uploadFile(profileImage, PROFILE_IMAGE_BUCKET);
        }
        return "";
    }

    private List<String> uploadProviderImages(List<MultipartFile> providerImages) {
        return Optional.ofNullable(providerImages)
                .orElse(Collections.emptyList())
                .stream()
                .filter(img -> !img.isEmpty())
                .map(img -> supabaseStorageService.uploadFile(img, PROVIDER_IMAGES))
                .toList();
    }

    private void fillUpdateProvider(ProviderRegistrationRequest request, ProviderProfileDO providerDo) {
        providerDo.setProviderBio(request.getProviderBio());
        providerDo.setProviderName(request.getProviderName());
        providerDo.setLocation(request.getLocation());
        providerDo.setGmtModified(LocalDateTime.now());
        providerDo.setMaxConcurrency(request.getMaxConcurrency());
    }
}
