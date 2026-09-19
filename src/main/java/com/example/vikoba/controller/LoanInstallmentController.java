package com.example.vikoba.controller;

import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.service.LoanInstallmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/installments")
@CrossOrigin(origins = "*")
public class LoanInstallmentController {

    private final LoanInstallmentService installmentService;

    public LoanInstallmentController(
            LoanInstallmentService installmentService
    ) {
        this.installmentService = installmentService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanInstallment> createInstallment(
            @RequestBody LoanInstallment installment
    ) {

        return ResponseEntity.ok(
                installmentService.saveInstallment(installment)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanInstallment>> getAllInstallments() {

        return ResponseEntity.ok(
                installmentService.getAllInstallments()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LoanInstallment> getInstallmentById(
            @PathVariable Long id
    ) {

        return installmentService.getInstallmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/loan/{loanId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanInstallment>>
    getInstallmentsByLoan(
            @PathVariable Long loanId
    ) {

        return ResponseEntity.ok(
                installmentService.getInstallmentsByLoan(loanId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/loan/{loanId}/number/{installmentNumber}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<LoanInstallment>
    getInstallmentByLoanAndNumber(
            @PathVariable Long loanId,
            @PathVariable Integer installmentNumber
    ) {

        return installmentService
                .getInstallmentByLoanAndNumber(
                        loanId,
                        installmentNumber
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LoanInstallment>>
    getInstallmentsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                installmentService.getInstallmentsByStatus(status)
        );
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanInstallment> updateInstallment(
            @PathVariable Long id,
            @RequestBody LoanInstallment installment
    ) {

        return ResponseEntity.ok(
                installmentService.updateInstallment(
                        id,
                        installment
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInstallment(
            @PathVariable Long id
    ) {

        installmentService.deleteInstallment(id);

        return ResponseEntity.noContent().build();
    }
}