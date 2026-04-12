package com.booking.entity.mapper;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.response.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(UserDO userDO) {
        return UserResponse.builder()
                .userId(userDO.getUserId())
                .username(userDO.getUsername())
                .email(userDO.getEmail())
                .phoneNo(userDO.getPhoneNo())
                .role(userDO.getRole())
                .profileImageUrl(userDO.getProfileImageUrl())
                .gmtCreate(userDO.getGmtCreate())
                .gmtModified(userDO.getGmtModified())
                .build();
    }
}
