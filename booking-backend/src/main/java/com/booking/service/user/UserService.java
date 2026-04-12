package com.booking.service.user;

import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.UserProfileUpdateRequest;
import com.booking.entity.DTO.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponse updateProfile(UserProfileUpdateRequest request, MultipartFile profileImage, UserDO user);
    UserResponse getProfile(UserDO user);
}
