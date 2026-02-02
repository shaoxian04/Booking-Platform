package com.booking.service.provider;

import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DTO.request.CreateServiceRequest;

public interface ServiceProvideService {

    public ServiceProvideDO createService (CreateServiceRequest request);
}
