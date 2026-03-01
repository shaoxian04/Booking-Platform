package com.booking.service.provider;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateServiceRequest;
import com.booking.entity.DTO.request.ServiceUpdateRequest;
import com.booking.entity.DTO.response.CreateServiceResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ServiceProvideService {

    public CreateServiceResponse createService(CreateServiceRequest request, List<MultipartFile> images, UserDO user);

    public List<CreateServiceResponse> getServicesByProvider(UserDO user);

    public CreateServiceResponse disableService(UUID serviceId);

    public CreateServiceResponse updateService(ServiceUpdateRequest request, List<MultipartFile> newImages, UUID serviceId);
}
