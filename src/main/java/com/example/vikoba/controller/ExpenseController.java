package com.example.vikoba.controller;

import com.example.vikoba.entity.Expense;
import com.example.vikoba.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @RequestBody Expense expense
    ) {
        return ResponseEntity.ok(
                expenseService.saveExpense(expense)
        );
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(
                expenseService.getAllExpenses()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(
            @PathVariable Long id
    ) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<Expense>> getExpensesByCycle(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByCycle(cycleId)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getExpensesByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByUser(userId)
        );
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Expense>> getExpensesBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesBetweenDates(
                        startDate,
                        endDate
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable Long id,
            @RequestBody Expense expense
    ) {
        return ResponseEntity.ok(
                expenseService.updateExpense(id, expense)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id
    ) {
        expenseService.deleteExpense(id);

        return ResponseEntity.noContent().build();
    }
}