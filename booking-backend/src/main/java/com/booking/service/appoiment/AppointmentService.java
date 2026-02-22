package com.booking.service.appoiment;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateAppointmentRequest;
import com.booking.entity.DTO.response.AppointmentResponse;

import java.util.UUID;

public interface AppointmentService {

    AppointmentResponse createAppointment (CreateAppointmentRequest request, UserDO user);

    AppointmentResponse deleteAppointment (UUID appointmentId, UserDO user);
}
