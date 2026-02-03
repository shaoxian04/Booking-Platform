package com.booking.entity.DO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_path", columnDefinition = "text[]")
    private List<String> imagePath;

    private Double rating;

    private String comments;

    private String remarks;

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

    @UpdateTimestamp
    @Column(name = "gmt_modified")
    private LocalDateTime gmtModified;
}
