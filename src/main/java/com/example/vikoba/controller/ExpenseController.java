package com.example.vikoba.controller;

import com.example.vikoba.entity.Expense;
import com.example.vikoba.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(
            ExpenseService expenseService
    ) {
        this.expenseService = expenseService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Expense> createExpense(
            @RequestBody Expense expense
    ) {
        return ResponseEntity.ok(
                expenseService.saveExpense(expense)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(
                expenseService.getAllExpenses()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Expense> getExpenseById(
            @PathVariable Long id
    ) {
        return expenseService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByCycle(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByCycle(cycleId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Expense>> getExpensesByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByUser(userId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable Long id,
            @RequestBody Expense expense
    ) {
        return ResponseEntity.ok(
                expenseService.updateExpense(id, expense)
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id
    ) {
        expenseService.deleteExpense(id);

        return ResponseEntity.noContent().build();
    }
}