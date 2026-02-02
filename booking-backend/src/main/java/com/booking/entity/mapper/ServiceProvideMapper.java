package com.booking.entity.mapper;

import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import org.springframework.stereotype.Component;

@Component
public class ServiceProvideMapper {

    public ServiceProvideDO toDO (CreateServiceRequest request, ProviderProfileDO provider){
        return ServiceProvideDO.builder()
                .provider(provider)
                .price(request.getPrice())
                .duration(request.getDuration())
                .serviceBio(request.getServiceBio())
                .serviceName(request.getServiceName())
                .imagePath(request.getImagePath())
                .build();
    }
}
