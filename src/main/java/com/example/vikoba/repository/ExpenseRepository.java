package com.example.vikoba.repository;

import com.example.vikoba.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByCycleId(Long cycleId);

    List<Expense> findByRecordedById(Long userId);

    List<Expense> findByExpenseDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}