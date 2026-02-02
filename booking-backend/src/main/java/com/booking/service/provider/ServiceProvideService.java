package com.booking.service.provider;

import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;

import java.util.List;

public interface ServiceProvideService {

    public ServiceProvideDO createService (CreateServiceRequest request, UserDO user);

    public List<ServiceProvideDO> getServicesByProvider (UserDO user);
}
