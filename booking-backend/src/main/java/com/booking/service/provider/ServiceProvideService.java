package com.booking.service.provider;

import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ServiceProvideService {

    public CreateServiceResponse createService (CreateServiceRequest request, List<MultipartFile> images, UserDO user);

    public List<ServiceProvideDO> getServicesByProvider (UserDO user);
}
