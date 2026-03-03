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

        // Validate that the appointment is within the provider's scheduled working hours
        boolean withinSchedule = providerDo.getSchedules().stream()
                .anyMatch(schedule -> {
                    boolean dayMatches = schedule.getDayOfWeek().name().equals(request.getStartTime().getDayOfWeek().name());
                    boolean startsAfter = !request.getStartTime().toLocalTime().isBefore(schedule.getStartTime());
                    boolean endsBefore = !request.getEndTime().toLocalTime().isAfter(schedule.getEndTime());
                    return dayMatches && startsAfter && endsBefore;
                });

        AssertUtil.isTrue(withinSchedule, new TimeSlotUnavailableException("The provider is not working during the requested time"));

        AssertUtil.isTrue(scheduleOverrideRepository.findOverlappingOverridesByService(providerDo.getProviderId(), serviceDo.getServiceId(), request.getStartTime(), request.getEndTime()).isEmpty(),
                new TimeSlotUnavailableException("The time slot is unavailable for provider"));

        AssertUtil.isTrue(appointmentRepository.countOverlappingAppointments(providerDo.getProviderId(), request.getStartTime(), request.getEndTime()) < providerDo.getMaxConcurrency(), new TimeSlotUnavailableException("The appointment time is booked"));

        AppointmentDO appointmentDO = appointmentMapper.toDO(request, serviceDo, user, providerDo);

        AppointmentDO newDo = appointmentRepository.save(appointmentDO);

        log.info("create appointment service completed, appointment id = {}", newDo.getId());
        return appointmentMapper.toResponse(newDo);
    }

    @Override
    @Transactional
    public AppointmentResponse deleteAppointment(UUID appointmentId, UserDO user) {

        log.info("delete appointment service start, user id = {}, appointment id = {}", user.getUserId(), appointmentId);

        AppointmentDO appointmentDO = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("The appointment not found in delete appointment service"));

        AssertUtil.isTrue(appointmentDO.getUser().getUserId().equals(user.getUserId()), new RuntimeException("The user id not match in delete appointment service"));

        providerProfileRepository.findByIdWithLock(appointmentDO.getService().getProvider().getProviderId())
                .orElseThrow(() -> new NotFoundException("Provider not found in delete appointment service"));

        appointmentRepository.delete(appointmentDO);

        log.info("delete appointment service completed, appointment id = {}", appointmentId);
        return appointmentMapper.toResponse(appointmentDO);
    }

    @Override
    public List<AppointmentResponse> queryUnacceptAppointmentByProviderId(UUID userId) {

        log.info("queryUnacceptAppointmentByProviderId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByProvider_User_UserIdAndIsAcceptedFalseAndIsCompletedFalse(userId);

        log.info("queryUnacceptAppointmentByProviderId service completed, result size = {}", appointmentDOS.size());
        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryAcceptedAppointmentByProviderId(UUID userId) {

        log.info("queryAcceptedAppointmentByProviderId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByProvider_User_UserIdAndIsAcceptedTrueAndIsCompletedFalse(userId);

        log.info("queryAcceptedAppointmentByProviderId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryCompletedAppointmentByProviderId(UUID userId) {

        log.info("queryCompletedAppointmentByProviderId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByProvider_User_UserIdAndIsCompletedTrue(userId);

        log.info("queryCompletedAppointmentByProviderId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryNotCompleteAppointmentByProviderId(UUID userId) {
        log.info("queryNotCompleteAppointmentByProviderId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByProvider_User_UserIdAndIsCompletedFalse(userId);

        log.info("queryNotCompleteAppointmentByProviderId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryUnacceptAppointmentByUserId(UUID userId) {
        log.info("queryUnacceptAppointmentByUserId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByUser_UserIdAndIsAcceptedFalseAndIsCompletedFalse(userId);

        log.info("queryUnacceptAppointmentByUserId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryAcceptedAppointmentByUserId(UUID userId) {
        log.info("queryAcceptedAppointmentByUserId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByUser_UserIdAndIsAcceptedTrueAndIsCompletedFalse(userId);

        log.info("queryAcceptedAppointmentByUserId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryCompletedAppointmentByUserId(UUID userId) {
        log.info("queryCompletedAppointmentByUserId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByUser_UserIdAndIsCompletedTrue(userId);

        log.info("queryCompletedAppointmentByUserId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> queryNotCompletedAppointmentByUserId(UUID userId) {

        log.info("queryNotCompletedAppointmentByUserId service start, userId = {}", userId);

        List<AppointmentDO> appointmentDOS = appointmentRepository.findByUser_UserIdAndIsCompletedFalse(userId);

        log.info("queryNotCompletedAppointmentByUserId service completed, result size = {}", appointmentDOS.size());

        return appointmentDOS.stream()
                .map(appointmentMapper::toResponse)
                .toList();
    }


    @Override
    @Transactional
    public AppointmentResponse acceptAppointment(UUID appointmentId) {
        log.info("acceptAppointment service start, appointmentId = {}", appointmentId);

        AppointmentDO appointmentDO = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        appointmentDO.setIsAccepted(true);

        AppointmentDO savedDo = appointmentRepository.save(appointmentDO);

        log.info("acceptAppointment service completed, appointmentId = {}", appointmentId);

        return appointmentMapper.toResponse(savedDo);
    }

    @Override
    @Transactional
    public AppointmentResponse completeAppointment(UUID appointmentId) {
        log.info("completeAppointment service start, appointmentId = {}", appointmentId);

        AppointmentDO appointmentDO = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        appointmentDO.setIsCompleted(true);

        AppointmentDO savedDo = appointmentRepository.save(appointmentDO);

        log.info("completeAppointment service completed, appointmentId = {}", appointmentId);

        return appointmentMapper.toResponse(savedDo);
    }

}
