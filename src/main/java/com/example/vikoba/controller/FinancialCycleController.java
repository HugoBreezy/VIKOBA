package com.example.vikoba.controller;

import com.example.vikoba.entity.FinancialCycle;
import com.example.vikoba.service.FinancialCycleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-cycles")
@CrossOrigin(origins = "*")
public class FinancialCycleController {

    private final FinancialCycleService financialCycleService;

    public FinancialCycleController(
            FinancialCycleService financialCycleService
    ) {
        this.financialCycleService = financialCycleService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FinancialCycle> createCycle(
            @RequestBody FinancialCycle cycle
    ) {

        return ResponseEntity.ok(
                financialCycleService.saveCycle(cycle)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<FinancialCycle>> getAllCycles() {

        return ResponseEntity.ok(
                financialCycleService.getAllCycles()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<FinancialCycle> getCycleById(
            @PathVariable Long id
    ) {

        return financialCycleService.getCycleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<FinancialCycle> getOpenCycle() {

        return financialCycleService.getOpenCycle()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FinancialCycle> updateCycle(
            @PathVariable Long id,
            @RequestBody FinancialCycle cycle
    ) {

        return ResponseEntity.ok(
                financialCycleService.updateCycle(id, cycle)
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCycle(
            @PathVariable Long id
    ) {

        financialCycleService.deleteCycle(id);

        return ResponseEntity.noContent().build();
    }
}