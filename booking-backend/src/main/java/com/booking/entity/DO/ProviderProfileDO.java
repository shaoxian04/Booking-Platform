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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "provider_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderProfileDO {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "provider_id")
    private UUID providerId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private UserDO user;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "provider_bio")
    private String providerBio;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "image_path", columnDefinition = "text[]")
    private List<String> imagePath;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    private String location;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Column(name = "max_concurrency")
    private Integer maxConcurrency;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

    @UpdateTimestamp
    @Column(name = "gmt_modified")
    private LocalDateTime gmtModified;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProviderScheduleDO> schedules;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleOverrideDO> overrides;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceProvideDO> providedServices;
}
