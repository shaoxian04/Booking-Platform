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
@Table(name = "service_provide")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleOverrideDO {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "override_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private ProviderProfileDO provider;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    private String remarks; // Reason for override (e.g., "Sick Leave")

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

}
