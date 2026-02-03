package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceProvideMapper {

    public ServiceProvideDO toDO (CreateServiceRequest request, ProviderProfileDO provider, List<String> images){
        return ServiceProvideDO.builder()
                .provider(provider)
                .price(request.getPrice())
                .duration(request.getDuration())
                .serviceBio(request.getServiceBio())
                .serviceName(request.getServiceName())
                .imagePath(images)
                .remarks(request.getRemarks())
                .build();
    }

    public CreateServiceResponse toResponse (ServiceProvideDO serviceDO) {
        return CreateServiceResponse.builder()
                .serviceId(serviceDO.getServiceId())
                .providerId(serviceDO.getProvider().getProviderId())
                .duration(serviceDO.getDuration())
                .price(serviceDO.getPrice())
                .imagePath(serviceDO.getImagePath())
                .serviceBio(serviceDO.getServiceBio())
                .remarks(serviceDO.getRemarks())
                .gmtCreate(serviceDO.getGmtCreate())
                .build();
    }
}
