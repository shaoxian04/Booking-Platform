package com.booking.service.provider.impl;

import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.exception.NotFoundException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.entity.mapper.ServiceProvideMapper;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.ServiceProvideRepository;
import com.booking.service.provider.ServiceProvideService;
import com.booking.service.storage.SupabaseStorageService;
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
@Validated
@RequiredArgsConstructor
public class ServiceProvideServiceImpl implements ServiceProvideService {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvideServiceImpl.class);

    private final ServiceProvideRepository serviceProvideRepository;

    private final ServiceProvideMapper serviceProvideMapper;

    private final ProviderProfileRepository providerProfileRepository;

    private final SupabaseStorageService supabaseStorageService;

    private static final String SERVICE_IMAGES = "service_images";

    @Override
    public CreateServiceResponse createService(CreateServiceRequest request, List<MultipartFile> images, UserDO user) {

        log.info("create service process start, username = {}", user.getUsername());

        ProviderProfileDO provider = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("Provider not found in DB"));

        AssertUtil.isTrue(!serviceProvideRepository.existsByProvider_ProviderIdAndServiceNameIgnoreCase(provider.getProviderId(), request.getServiceName()), new AlreadyExistedException("Duplicate service name for provider"));

        List<String> imagePaths = Optional.ofNullable(images)
                .orElse(Collections.emptyList())
                .stream()
                .filter(img -> !img.isEmpty())
                .map(img -> supabaseStorageService.uploadFile(img, SERVICE_IMAGES))
                .toList();

        ServiceProvideDO serviceDO = serviceProvideMapper.toDO(request, provider, imagePaths);

        ServiceProvideDO newService = serviceProvideRepository.save(serviceDO);

        return serviceProvideMapper.toResponse(newService);
    }

    @Override
    public List<ServiceProvideDO> getServicesByProvider(UserDO user) {

        log.info("get service for provider by user, username = {}", user.getUsername());

        ProviderProfileDO provider = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("Provider not found in DB"));

        return serviceProvideRepository.findByProvider_ProviderId(provider.getProviderId());
    }
}
