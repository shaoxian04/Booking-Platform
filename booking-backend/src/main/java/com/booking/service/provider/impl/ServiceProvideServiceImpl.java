package com.booking.service.provider.impl;

import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.exception.NotFoundException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.mapper.ServiceProvideMapper;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.ServiceProvideRepository;
import com.booking.service.provider.ServiceProvideService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Validated
@RequiredArgsConstructor
public class ServiceProvideServiceImpl implements ServiceProvideService {

    private static final Logger log = LoggerFactory.getLogger(ServiceProvideServiceImpl.class);

    private final ServiceProvideRepository serviceProvideRepository;

    private final ServiceProvideMapper serviceProvideMapper;

    private final ProviderProfileRepository providerProfileRepository;

    @Override
    public ServiceProvideDO createService(CreateServiceRequest request, UserDO user) {

        log.info("create service process start, username = {}", user.getUsername());

        ProviderProfileDO provider = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("Provider not found in DB"));

        AssertUtil.isTrue(serviceProvideRepository.existByProvider_ProviderIdAndServiceNameIgnoreCase(provider, request.getServiceName()), new AlreadyExistedException("Duplicate service name for provider"));

        ServiceProvideDO serviceDO = serviceProvideMapper.toDO(request, provider);

        return serviceProvideRepository.save(serviceDO);
    }

    @Override
    public List<ServiceProvideDO> getServicesByProvider(UserDO user) {

        log.info("get service for provider by user, username = {}", user.getUsername());

        ProviderProfileDO provider = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("Provider not found in DB"));

        return serviceProvideRepository.findByProvider_ProviderId(provider.getProviderId());
    }
}
