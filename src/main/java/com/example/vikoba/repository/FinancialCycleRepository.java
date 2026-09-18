package com.example.vikoba.repository;

import com.example.vikoba.entity.FinancialCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinancialCycleRepository extends JpaRepository<FinancialCycle, Long> {

    Optional<FinancialCycle> findByStatus(String status);

    boolean existsByName(String name);
}