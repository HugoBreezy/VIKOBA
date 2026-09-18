package com.example.vikoba.controller;

import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.service.LoanInstallmentService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<LoanInstallment> createInstallment(
            @RequestBody LoanInstallment installment
    ) {
        return ResponseEntity.ok(
                installmentService.saveInstallment(installment)
        );
    }

    @GetMapping
    public ResponseEntity<List<LoanInstallment>> getAllInstallments() {
        return ResponseEntity.ok(
                installmentService.getAllInstallments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanInstallment> getInstallmentById(
            @PathVariable Long id
    ) {
        return installmentService.getInstallmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<LoanInstallment>>
    getInstallmentsByLoan(
            @PathVariable Long loanId
    ) {
        return ResponseEntity.ok(
                installmentService.getInstallmentsByLoan(loanId)
        );
    }

    @GetMapping("/loan/{loanId}/number/{installmentNumber}")
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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanInstallment>>
    getInstallmentsByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                installmentService.getInstallmentsByStatus(status)
        );
    }

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstallment(
            @PathVariable Long id
    ) {
        installmentService.deleteInstallment(id);

        return ResponseEntity.noContent().build();
    }
}