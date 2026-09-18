package com.example.vikoba.service;

import com.example.vikoba.entity.Expense;
import com.example.vikoba.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository
    ) {
        this.expenseRepository = expenseRepository;
    }

    /*
     * Record a new expense.
     */
    public Expense saveExpense(Expense expense) {

        validateExpense(expense);

        /*
         * Automatically use today's date
         * when expense date is not provided.
         */
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDate.now());
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    public List<Expense> getExpensesByCycle(Long cycleId) {

        if (cycleId == null) {
            throw new IllegalArgumentException(
                    "Financial cycle ID is required"
            );
        }

        return expenseRepository.findByCycleId(cycleId);
    }

    public List<Expense> getExpensesByUser(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return expenseRepository.findByRecordedById(userId);
    }

    public List<Expense> getExpensesBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        return expenseRepository.findByExpenseDateBetween(
                startDate,
                endDate
        );
    }

    /*
     * Update an existing expense.
     */
    public Expense updateExpense(
            Long id,
            Expense updatedExpense
    ) {

        Expense existingExpense =
                expenseRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Expense not found with id: "
                                                + id
                                )
                        );

        validateExpense(updatedExpense);

        /*
         * Update only fields that are allowed
         * to change.
         */
        existingExpense.setCycle(
                updatedExpense.getCycle()
        );

        existingExpense.setAmount(
                updatedExpense.getAmount()
        );

        /*
         * If no date is supplied during update,
         * keep the existing date.
         */
        if (updatedExpense.getExpenseDate() != null) {

            existingExpense.setExpenseDate(
                    updatedExpense.getExpenseDate()
            );
        }

        existingExpense.setDescription(
                updatedExpense.getDescription()
        );

        /*
         * Do NOT allow recordedBy to be changed
         * through the update request.
         *
         * The original recordedBy remains attached
         * to the expense.
         */

        return expenseRepository.save(existingExpense);
    }

    /*
     * Delete an expense.
     */
    public void deleteExpense(Long id) {

        if (!expenseRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Expense not found with id: " + id
            );
        }

        expenseRepository.deleteById(id);
    }

    /*
     * Validate expense information.
     */
    private void validateExpense(
            Expense expense
    ) {

        if (expense == null) {

            throw new IllegalArgumentException(
                    "Expense data cannot be null"
            );
        }

        /*
         * Every expense must belong to
         * a financial cycle.
         */
        if (expense.getCycle() == null ||
                expense.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is required"
            );
        }

        /*
         * Expense amount must be greater than zero.
         */
        if (expense.getAmount() == null ||
                expense.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Expense amount must be greater than zero"
            );
        }

        /*
         * Description is required.
         */
        if (expense.getDescription() == null ||
                expense.getDescription().isBlank()) {

            throw new IllegalArgumentException(
                    "Expense description is required"
            );
        }

        /*
         * If a date is supplied, it cannot be
         * in the future.
         */
        if (expense.getExpenseDate() != null &&
                expense.getExpenseDate()
                        .isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Expense date cannot be in the future"
            );
        }
    }
}