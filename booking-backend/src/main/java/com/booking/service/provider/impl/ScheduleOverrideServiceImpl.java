package com.booking.service.provider.impl;

import com.booking.common.exception.NotFoundException;
import com.booking.common.exception.TimeSlotUnavailableException;
import com.booking.common.util.AssertUtil;
import com.booking.entity.DO.*;
import com.booking.entity.DTO.request.CreateScheduleOverrideRequest;
import com.booking.entity.DTO.response.CreateScheduleOverrideResponse;
import com.booking.entity.DTO.response.QueryScheduleOverrideResponse;
import com.booking.entity.mapper.ScheduleOverrideMapper;
import com.booking.repository.AppointmentRepository;
import com.booking.repository.ProviderProfileRepository;
import com.booking.repository.ScheduleOverrideRepository;
import com.booking.repository.ServiceProvideRepository;
import com.booking.service.provider.ScheduleOverrideService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Validated
public class ScheduleOverrideServiceImpl implements ScheduleOverrideService {

    private static final Logger log = LoggerFactory.getLogger(ScheduleOverrideServiceImpl.class);

    private final ScheduleOverrideRepository scheduleOverrideRepository;

    private final ProviderProfileRepository providerProfileRepository;

    private final ScheduleOverrideMapper scheduleOverrideMapper;

    private final ServiceProvideRepository serviceProvideRepository;

    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public CreateScheduleOverrideResponse createScheduleOverride(CreateScheduleOverrideRequest request, UserDO user) {

        log.info("create schedule override service start, user = {}", user.getUserId());

        ProviderProfileDO providerDo = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("The provider not found in schedule override service"));

        List<ServiceProvideDO> serviceDos = new ArrayList<>();
        List<AppointmentDO> conflictAppointmentDOS;

        if(request.getSpecificServices() != null && !request.getSpecificServices().isEmpty()) {
            serviceDos = serviceProvideRepository.findAllById(request.getSpecificServices());

            AssertUtil.isTrue(serviceDos.size() == request.getSpecificServices().size(), new NotFoundException("One or more services not found in schedule override service"));

            List<UUID> serviceIds = serviceDos.stream()
                    .map(ServiceProvideDO::getServiceId)
                    .toList();

            conflictAppointmentDOS = appointmentRepository.findConflictingAppointmentsByServices(providerDo.getProviderId(), serviceIds, request.getStartTime(), request.getEndTime());

        } else {
            conflictAppointmentDOS = appointmentRepository.findConflictingAppointmentsByProvider(providerDo.getProviderId(), request.getStartTime(), request.getEndTime());
        }

        if (!conflictAppointmentDOS.isEmpty()) {
            AppointmentDO firstConflict = conflictAppointmentDOS.getFirst();

            throw new TimeSlotUnavailableException(String.format("Cannot create override. You already have an existing appointment from %s to %s", firstConflict.getStartTime(), firstConflict.getEndTime()));
        }

        ScheduleOverrideDO scheduleDo = scheduleOverrideMapper.toDO(request, providerDo, serviceDos);

        ScheduleOverrideDO newScheduleDo = scheduleOverrideRepository.save(scheduleDo);

        log.info("new schedule override created, override_id = {}, startTime = {}, endTime = {}, services involved = {}", newScheduleDo.getId(), newScheduleDo.getStartTime(), newScheduleDo.getEndTime(), request.getSpecificServices());

        return scheduleOverrideMapper.toResponse(newScheduleDo, request.getSpecificServices());
    }

    @Override
    @Transactional
    public CreateScheduleOverrideResponse deleteScheduleOverride(UUID overrideId) {

        log.info("delete schedule override service started , override_id = {}", overrideId);

        ScheduleOverrideDO scheduleOverrideDO = scheduleOverrideRepository.findById(overrideId)
                .orElseThrow(() -> new NotFoundException("The schedule override id is not found in delete schedule override service"));

        scheduleOverrideRepository.deleteById(overrideId);

        return scheduleOverrideMapper.toDeleteResponse(scheduleOverrideDO);

    }

    @Override
    public List<ScheduleOverrideDO> findOverlappingOverridesByService(LocalDateTime startTime, LocalDateTime endTime, UUID providerId, UUID serviceId) {

        log.info("find overlapping schedule override by service, service_id = {}", serviceId);

        return scheduleOverrideRepository.findOverlappingOverridesByService(providerId, serviceId, startTime, endTime);
    }

    @Override
    public List<QueryScheduleOverrideResponse> findOverlappingOverridesByService(LocalDateTime startTime, LocalDateTime endTime, UserDO user, UUID serviceId) {

        ProviderProfileDO providerProfileDO = providerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new NotFoundException("The provider not found in schedule override service"));

        log.info("find overlapping schedule override to response by service, service_id = {}", serviceId);

        return scheduleOverrideRepository.findOverlappingOverridesByService(providerProfileDO.getProviderId(), serviceId, startTime, endTime)
                .stream()
                .map(scheduleOverrideMapper::toQueryResponse)
                .toList();

    }
}
