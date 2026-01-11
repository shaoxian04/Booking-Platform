package com.booking.repository;

import com.booking.entity.DO.UserDO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserDO, UUID> {

    Optional<UserDO> findByUsername(String username);

    Optional<UserDO> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
