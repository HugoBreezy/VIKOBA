package com.example.vikoba.controller;

import com.example.vikoba.entity.LoanPayment;
import com.example.vikoba.service.LoanPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class LoanPaymentController {

    private final LoanPaymentService loanPaymentService;

    public LoanPaymentController(
            LoanPaymentService loanPaymentService
    ) {
        this.loanPaymentService = loanPaymentService;
    }

    @PostMapping
    public ResponseEntity<LoanPayment> createPayment(
            @RequestBody LoanPayment payment
    ) {
        return ResponseEntity.ok(
                loanPaymentService.savePayment(payment)
        );
    }

    @GetMapping
    public ResponseEntity<List<LoanPayment>> getAllPayments() {
        return ResponseEntity.ok(
                loanPaymentService.getAllPayments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanPayment> getPaymentById(
            @PathVariable Long id
    ) {
        return loanPaymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/installment/{installmentId}")
    public ResponseEntity<List<LoanPayment>> getPaymentsByInstallment(
            @PathVariable Long installmentId
    ) {
        return ResponseEntity.ok(
                loanPaymentService.getPaymentsByInstallment(
                        installmentId
                )
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LoanPayment>> getPaymentsByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                loanPaymentService.getPaymentsByUser(userId)
        );
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<LoanPayment>> getPaymentsBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                loanPaymentService.getPaymentsBetweenDates(
                        startDate,
                        endDate
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanPayment> updatePayment(
            @PathVariable Long id,
            @RequestBody LoanPayment payment
    ) {
        return ResponseEntity.ok(
                loanPaymentService.updatePayment(id, payment)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long id
    ) {
        loanPaymentService.deletePayment(id);

        return ResponseEntity.noContent().build();
    }
}