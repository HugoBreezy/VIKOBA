package com.example.vikoba.controller;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<Loan> createLoan(
            @RequestBody Loan loan
    ) {
        return ResponseEntity.ok(
                loanService.saveLoan(loan)
        );
    }

    @GetMapping
    public ResponseEntity<List<Loan>> getAllLoans() {
        return ResponseEntity.ok(
                loanService.getAllLoans()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(
            @PathVariable Long id
    ) {
        return loanService.getLoanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Loan>> getLoansByMember(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(
                loanService.getLoansByMember(memberId)
        );
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<Loan>> getLoansByCycle(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                loanService.getLoansByCycle(cycleId)
        );
    }

    @GetMapping("/member/{memberId}/cycle/{cycleId}")
    public ResponseEntity<List<Loan>> getMemberLoansByCycle(
            @PathVariable Long memberId,
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                loanService.getMemberLoansByCycle(
                        memberId,
                        cycleId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Loan>> getLoansByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                loanService.getLoansByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loan> updateLoan(
            @PathVariable Long id,
            @RequestBody Loan loan
    ) {
        return ResponseEntity.ok(
                loanService.updateLoan(id, loan)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(
            @PathVariable Long id
    ) {
        loanService.deleteLoan(id);

        return ResponseEntity.noContent().build();
    }
}