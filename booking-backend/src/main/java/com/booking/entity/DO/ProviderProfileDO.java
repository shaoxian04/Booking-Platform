package com.booking.entity.DO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
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

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "available_time", nullable = false)
    private String availableTime;

    private String location;

    @Column(name = "ext_info")
    private String extInfo;

    @CreationTimestamp
    @Column(name = "gmt_create", updatable = false)
    private LocalDateTime gmtCreate;

    @UpdateTimestamp
    @Column(name = "gmt_modified")
    private LocalDateTime gmtModified;
}
