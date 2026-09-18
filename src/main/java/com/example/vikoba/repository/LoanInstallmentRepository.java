package com.example.vikoba.repository;

import com.example.vikoba.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanInstallmentRepository extends JpaRepository<LoanInstallment, Long> {

    List<LoanInstallment> findByLoanId(Long loanId);

    Optional<LoanInstallment> findByLoanIdAndInstallmentNumber(
            Long loanId,
            Integer installmentNumber
    );

    List<LoanInstallment> findByStatus(String status);
}