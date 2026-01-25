package com.booking.entity.DO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_provide")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProvideDO {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "service_id")
    private UUID serviceId;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private ProviderProfileDO provider;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "service_bio")
    private String serviceBio;

    //Minutes
    private Integer duration;

    private BigDecimal price;

    @Column(name = "image_path")
    private String imagePath;

    private Double rating;

    private String comments;

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

    @UpdateTimestamp
    @Column(name = "gmt_modified")
    private LocalDateTime gmtModified;
}
