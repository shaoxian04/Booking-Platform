package com.booking.service.appoiment;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateAppointmentRequest;
import com.booking.entity.DTO.response.AppointmentResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    AppointmentResponse createAppointment(CreateAppointmentRequest request, UserDO user);

    AppointmentResponse deleteAppointment(UUID appointmentId, UserDO user);

    List<AppointmentResponse> queryUnacceptAppointmentByProviderId(UUID userId);

    List<AppointmentResponse> queryAcceptedAppointmentByProviderId(UUID userId);

    List<AppointmentResponse> queryCompletedAppointmentByProviderId(UUID userId);

    List<AppointmentResponse> queryNotCompleteAppointmentByProviderId(UUID userId);

    List<AppointmentResponse> queryUnacceptAppointmentByUserId(UUID userId);

    List<AppointmentResponse> queryAcceptedAppointmentByUserId(UUID userId);

    List<AppointmentResponse> queryCompletedAppointmentByUserId(UUID userId);

    List<AppointmentResponse> queryNotCompletedAppointmentByUserId(UUID userId);

    AppointmentResponse acceptAppointment(UUID appointmentId);

    AppointmentResponse completeAppointment(UUID appointmentId);
}
