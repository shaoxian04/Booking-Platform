package com.booking.entity.DO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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

    private Double rating; // e.g., 4.5

    private String comments;
}
