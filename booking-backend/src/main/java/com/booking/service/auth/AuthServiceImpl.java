package com.booking.service.auth;

import com.booking.common.enums.Role;
import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.security.CustomUserDetails;
import com.booking.common.template.ServiceTemplate;
import com.booking.common.util.AssertUtil;
import com.booking.common.util.JwtUtil;
import com.booking.entity.DO.UserDO;
import com.booking.entity.DTO.request.LoginRequest;
import com.booking.entity.DTO.request.RegisterRequest;
import com.booking.entity.DTO.response.JwtResponse;
import com.booking.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.validation.annotation.Validated;

@Service
@RequiredArgsConstructor
@Validated
public class AuthServiceImpl implements AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final ServiceTemplate authServiceTemplate;

    private final TransactionTemplate authTransactionTemplate;

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("Register service start, request = [{}]", request);

        AssertUtil.isTrue(!userRepository.existsByEmail(request.getEmail()), new AlreadyExistedException("email already existed"));

        AssertUtil.isTrue(!userRepository.existsByUsername(request.getUsername()), new AlreadyExistedException("username already existed"));

        UserDO user = fillRegisterUser(request);

        userRepository.save(user);

        log.info("User registered successfully, username = {}", user.getUsername());
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        log.info("Login service starts, usernameOrEmail = [{}]", request.getUsernameOrEmail());

        //It automatically checks if the user exists AND if the password is correct.
        // If the password is wrong, it throws 'BadCredentialsException' right here.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = JwtUtil.generateToken(request.getUsernameOrEmail());

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserDO user = userDetails.getUser();

        log.info("User login successfully, usernameOrEmail = [{}]", request.getUsernameOrEmail());

        return fillJwtResponse(user, jwt);
    }

    private UserDO fillRegisterUser(RegisterRequest request) {
        return UserDO.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phoneNo(request.getPhoneNo())
                .role(Role.VIEWER)
                .build();

    }

    private JwtResponse fillJwtResponse(UserDO user, String jwt) {
        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().getCode())
                .build();
    }
}
