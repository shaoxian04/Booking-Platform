package com.booking.service.provider.impl;

import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.exception.NotFoundException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.request.ServiceUpdateRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import com.booking.entity.mapper.ServiceProvideMapper;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.ServiceProvideRepository;
import com.booking.service.provider.ServiceProvideService;
import com.booking.service.storage.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@Validated
@RequiredArgsConstructor
public class ServiceProvideServiceImpl implements ServiceProvideService {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvideServiceImpl.class);
    private static final String SERVICE_IMAGES = "service_images";
    private final ServiceProvideRepository serviceProvideRepository;
    private final ServiceProvideMapper serviceProvideMapper;
    private final ProviderProfileRepository providerProfileRepository;
    private final SupabaseStorageService supabaseStorageService;

    @Override
    @Transactional
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
    public List<CreateServiceResponse> getServicesByProvider(UserDO user) {

        log.info("get service for provider by user, username = {}", user.getUsername());

        ProviderProfileDO provider = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("Provider not found in DB"));

        List<ServiceProvideDO> serviceProvideDOS = serviceProvideRepository.findByProviderId(provider.getProviderId());

        return serviceProvideDOS.stream()
                .map(serviceProvideMapper::toResponse)
                .toList();
    }

    @Override
    public CreateServiceResponse disableService(UUID serviceId) {

        log.info("disableService, serviceId = {}", serviceId);

        ServiceProvideDO serviceDo = serviceProvideRepository.findById(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found"));

        serviceDo.setPublished(false);

        ServiceProvideDO newServiceDo = serviceProvideRepository.save(serviceDo);

        log.info("disableService success, serviceId = {}, serviceName = {}", newServiceDo.getServiceId(), newServiceDo.getServiceName());

        return serviceProvideMapper.toResponse(newServiceDo);
    }


    @Override
    public CreateServiceResponse updateService(ServiceUpdateRequest request, List<MultipartFile> newImages, UUID serviceId) {

        log.info("updateService, serviceId = {}, serviceName= {}", serviceId, request.getServiceName());

        ServiceProvideDO serviceDo = serviceProvideRepository.findById(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found"));

        List<String> finalImagesUrl = new ArrayList<>();

        List<String> existingImages = request.getExistingImages();

        if(!existingImages.isEmpty()) {
            finalImagesUrl.addAll(existingImages);
        }

        if(!newImages.isEmpty()) {
            List<String> newImagesUrl = newImages.stream()
                    .filter(img -> !img.isEmpty())
                    .map(img -> supabaseStorageService.uploadFile(img, SERVICE_IMAGES))
                    .toList();

            finalImagesUrl.addAll(newImagesUrl);
        }

        serviceDo.getImagePath().clear();
        serviceDo.setImagePath(finalImagesUrl);

        fillUpdateService(request, serviceDo);

        ServiceProvideDO newServiceDo = serviceProvideRepository.save(serviceDo);

        log.info("updateService success, serviceId = {}, serviceName = {}", newServiceDo.getServiceId(), newServiceDo.getServiceName());

        return serviceProvideMapper.toResponse(newServiceDo);
    }

    private void fillUpdateService(CreateServiceRequest request, ServiceProvideDO serviceDo) {

        serviceDo.setServiceName(request.getServiceName());
        serviceDo.setServiceBio(request.getServiceBio());
        serviceDo.setDuration(request.getDuration());
        serviceDo.setPrice(request.getPrice());
    }
}
