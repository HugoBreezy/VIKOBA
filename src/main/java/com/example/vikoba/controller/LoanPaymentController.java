package com.example.vikoba.controller;

import com.example.vikoba.entity.LoanPayment;
import com.example.vikoba.service.LoanPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanPayment> createPayment(
            @RequestBody LoanPayment payment
    ) {

        return ResponseEntity.ok(
                loanPaymentService.savePayment(payment)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanPayment>> getAllPayments() {

        return ResponseEntity.ok(
                loanPaymentService.getAllPayments()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LoanPayment> getPaymentById(
            @PathVariable Long id
    ) {

        return loanPaymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/installment/{installmentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanPayment>> getPaymentsByInstallment(
            @PathVariable Long installmentId
    ) {

        return ResponseEntity.ok(
                loanPaymentService.getPaymentsByInstallment(
                        installmentId
                )
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanPayment>> getPaymentsByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                loanPaymentService.getPaymentsByUser(userId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanPayment> updatePayment(
            @PathVariable Long id,
            @RequestBody LoanPayment payment
    ) {

        return ResponseEntity.ok(
                loanPaymentService.updatePayment(
                        id,
                        payment
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long id
    ) {

        loanPaymentService.deletePayment(id);

        return ResponseEntity.noContent().build();
    }
}