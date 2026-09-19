package com.example.vikoba.controller;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Loan> createLoan(
            @RequestBody Loan loan
    ) {

        return ResponseEntity.ok(
                loanService.saveLoan(loan)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Loan>> getAllLoans() {

        return ResponseEntity.ok(
                loanService.getAllLoans()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Loan> getLoanById(
            @PathVariable Long id
    ) {

        return loanService.getLoanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Loan>> getLoansByMember(
            @PathVariable Long memberId
    ) {

        return ResponseEntity.ok(
                loanService.getLoansByMember(memberId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Loan>> getLoansByCycle(
            @PathVariable Long cycleId
    ) {

        return ResponseEntity.ok(
                loanService.getLoansByCycle(cycleId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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

    /*
     * USER + ADMIN
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Loan>> getLoansByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                loanService.getLoansByStatus(status)
        );
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Loan> updateLoan(
            @PathVariable Long id,
            @RequestBody Loan loan
    ) {

        return ResponseEntity.ok(
                loanService.updateLoan(id, loan)
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLoan(
            @PathVariable Long id
    ) {

        loanService.deleteLoan(id);

        return ResponseEntity.noContent().build();
    }
}