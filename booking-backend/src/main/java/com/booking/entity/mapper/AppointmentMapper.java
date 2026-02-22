package com.booking.entity.mapper;

import com.booking.entity.DO.AppointmentDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateAppointmentRequest;
import com.booking.entity.DTO.response.AppointmentResponse;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    public AppointmentDO toDO (CreateAppointmentRequest request, ServiceProvideDO serviceDo, UserDO user) {
        return AppointmentDO.builder()
                .service(serviceDo)
                .user(user)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .remarks(request.getRemarks())
                .build();
    }

    public AppointmentResponse toResponse (AppointmentDO appointmentDO) {
        return AppointmentResponse.builder()
                .appointmentId(appointmentDO.getId())
                .serviceId(appointmentDO.getService().getServiceId())
                .userId(appointmentDO.getUser().getUserId())
                .startTime(appointmentDO.getStartTime())
                .endTime(appointmentDO.getEndTime())
                .remarks(appointmentDO.getRemarks())
                .gmtCreate(appointmentDO.getGmtCreate())
                .build();
    }
}
