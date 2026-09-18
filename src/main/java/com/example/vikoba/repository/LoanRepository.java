package com.example.vikoba.repository;

import com.example.vikoba.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByMemberId(Long memberId);

    List<Loan> findByCycleId(Long cycleId);

    List<Loan> findByMemberIdAndCycleId(
            Long memberId,
            Long cycleId
    );

    List<Loan> findByStatus(String status);
}