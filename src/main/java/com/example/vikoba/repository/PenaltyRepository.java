package com.example.vikoba.repository;

import com.example.vikoba.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    List<Penalty> findByInstallmentId(Long installmentId);

    Optional<Penalty> findByInstallmentIdAndStatus(
            Long installmentId,
            String status
    );

    List<Penalty> findByStatus(String status);
}