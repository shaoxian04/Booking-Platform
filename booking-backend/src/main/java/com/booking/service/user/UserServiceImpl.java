package com.booking.service.user;

import com.booking.common.exception.NotFoundException;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.UserProfileUpdateRequest;
import com.booking.entity.DTO.response.UserResponse;
import com.booking.entity.mapper.UserMapper;
import com.booking.repository.UserRepository;
import com.booking.service.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
@Validated
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final UserMapper userMapper;

    private static final String BUCKET_NAME = "user_profile_image";

    @Override
    @Transactional
    public UserResponse updateProfile(UserProfileUpdateRequest request, MultipartFile profileImage, UserDO user) {
        log.info("updating profile for user, username = {}, userId = {}", user.getUsername(), user.getUserId());

        UserDO userDO = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        fillUpdateUser(userDO, request);

        UserDO updatedUser = userRepository.save(userDO);
        log.info("profile updated successfully for user, username = {}", updatedUser.getUsername());
        return userMapper.toResponse(updatedUser);
    }

    @Override
    public UserResponse getProfile(UserDO user) {

        log.info("get profile for user, username = {}, userId = {}", user.getUsername(), user.getUserId());

        UserDO userDO = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return userMapper.toResponse(userDO);
    }

    private void fillUpdateUser(UserDO userDO, UserProfileUpdateRequest request) {
        userDO.setUsername(request.getUsername());
        userDO.setEmail(request.getEmail());
        userDO.setPhoneNo(request.getPhoneNo());
    }
}
