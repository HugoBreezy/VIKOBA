package com.example.vikoba.repository;

import com.example.vikoba.entity.ShareOut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShareOutRepository extends JpaRepository<ShareOut, Long> {

    Optional<ShareOut> findByCycleId(Long cycleId);

    Optional<ShareOut> findByCycleIdAndStatus(
            Long cycleId,
            String status
    );

    boolean existsByCycleId(Long cycleId);
}