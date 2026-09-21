package com.example.vikoba.controller;

import com.example.vikoba.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // 1. Cycle Financial Report
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCycleFinancialReport(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                reportService.getCycleFinancialReport(cycleId)
        );
    }

    // 2. Member Report
    @GetMapping("/member/{memberId}/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getMemberReport(
            @PathVariable Long memberId,
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                reportService.getMemberReport(
                        memberId,
                        cycleId
                )
        );
    }

    // 3. Loan Report
    @GetMapping("/loan/{loanId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getLoanReport(
            @PathVariable Long loanId
    ) {
        return ResponseEntity.ok(
                reportService.getLoanReport(loanId)
        );
    }

    // 4. Contribution Report
    @GetMapping("/contributions/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getContributionReport(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                reportService.getContributionReport(cycleId)
        );
    }

    // 5. Expense Report
    @GetMapping("/expenses/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getExpenseReport(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                reportService.getExpenseReport(cycleId)
        );
    }

    // 6. Penalty Report
    @GetMapping("/penalties")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPenaltyReport() {
        return ResponseEntity.ok(
                reportService.getPenaltyReport()
        );
    }

    // 7. Share-Out Report
    @GetMapping("/share-outs/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getShareOutReport(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                reportService.getShareOutReport(cycleId)
        );
    }
}