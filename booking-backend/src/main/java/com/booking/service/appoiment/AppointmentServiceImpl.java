package com.booking.service.appoiment;

import com.booking.common.exception.TimeSlotUnavailableException;
import com.booking.common.exception.NotFoundException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.AppointmentDO;
import com.booking.entity.DO.ProviderProfileDO;
import com.booking.entity.DO.ServiceProvideDO;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.CreateAppointmentRequest;
import com.booking.entity.DTO.response.AppointmentResponse;
import com.booking.entity.mapper.AppointmentMapper;
import com.booking.repository.AppointmentRepository;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.ScheduleOverrideRepository;
import com.booking.repository.ServiceProvideRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.UUID;

@Service
@Validated
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;

    private final ServiceProvideRepository serviceProvideRepository;

    private final ProviderProfileRepository providerProfileRepository;

    private final AppointmentMapper appointmentMapper;

    private final ScheduleOverrideRepository scheduleOverrideRepository;

    @Override
    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, UserDO user) {

        log.info("create appointment service start, username = {}, service id = {}, start time = {}, end time = {}", user.getUsername(), request.getServiceId(), request.getStartTime(), request.getEndTime());

        ServiceProvideDO serviceDo = serviceProvideRepository.findById(request.getServiceId())
                .orElseThrow(() -> new NotFoundException("no service found in the appointment request"));

        ProviderProfileDO providerDo = providerProfileRepository.findByIdWithLock(serviceDo.getProvider().getProviderId())
                .orElseThrow(() -> new NotFoundException("no provider found for the service in appointment request"));

        AssertUtil.isTrue(scheduleOverrideRepository.findOverlappingOverridesByService(providerDo.getProviderId(), serviceDo.getServiceId(), request.getStartTime(), request.getEndTime()).isEmpty(),
                new TimeSlotUnavailableException("The time slot is unavailable for provider"));

        AssertUtil.isTrue(appointmentRepository.countOverlappingAppointments(providerDo.getProviderId(), request.getStartTime(), request.getEndTime()) < providerDo.getMaxConcurrency(), new TimeSlotUnavailableException("The appointment time is booked"));

        AppointmentDO appointmentDO = appointmentMapper.toDO(request, serviceDo, user, providerDo);

        AppointmentDO newDo = appointmentRepository.save(appointmentDO);

        return appointmentMapper.toResponse(newDo);
    }

    @Override
    @Transactional
    public AppointmentResponse deleteAppointment(UUID appointmentId, UserDO user) {

        log.info("delete appointment service start, user id = {}, appointment id = {}", user.getUserId(), appointmentId);

        List<AppointmentDO> list = appointmentRepository.findAll();
        log.info("list = {}",list);

        AppointmentDO appointmentDO = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("The appointment not found in delete appointment service"));

        AssertUtil.isTrue(appointmentDO.getUser().getUserId().equals(user.getUserId()), new RuntimeException("The user id not match in delete appointment service"));

        providerProfileRepository.findByIdWithLock(appointmentDO.getService().getProvider().getProviderId())
                .orElseThrow(() -> new NotFoundException("Provider not found in delete appointment service"));

        appointmentRepository.delete(appointmentDO);

        return appointmentMapper.toResponse(appointmentDO);
    }

}
