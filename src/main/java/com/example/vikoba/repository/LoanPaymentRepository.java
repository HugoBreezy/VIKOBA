package com.example.vikoba.repository;

import com.example.vikoba.entity.LoanPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanPaymentRepository extends JpaRepository<LoanPayment, Long> {

    List<LoanPayment> findByInstallmentId(Long installmentId);

    List<LoanPayment> findByRecordedById(Long userId);

    List<LoanPayment> findByPaymentDateBetween(
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );
}