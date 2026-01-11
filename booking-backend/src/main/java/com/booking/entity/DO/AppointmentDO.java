package com.booking.entity.DO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDO {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "appointment_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceProvideDO service;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserDO customer;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    private String remarks;

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

}
