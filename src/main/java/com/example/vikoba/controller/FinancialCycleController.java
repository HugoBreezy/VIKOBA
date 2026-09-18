package com.example.vikoba.controller;

import com.example.vikoba.entity.FinancialCycle;
import com.example.vikoba.service.FinancialCycleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@CrossOrigin(origins = "*")
public class FinancialCycleController {

    private final FinancialCycleService financialCycleService;

    public FinancialCycleController(
            FinancialCycleService financialCycleService
    ) {
        this.financialCycleService = financialCycleService;
    }

    @PostMapping
    public ResponseEntity<FinancialCycle> createCycle(
            @RequestBody FinancialCycle cycle
    ) {
        return ResponseEntity.ok(
                financialCycleService.saveCycle(cycle)
        );
    }

    @GetMapping
    public ResponseEntity<List<FinancialCycle>> getAllCycles() {
        return ResponseEntity.ok(
                financialCycleService.getAllCycles()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialCycle> getCycleById(
            @PathVariable Long id
    ) {
        return financialCycleService.getCycleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/open")
    public ResponseEntity<FinancialCycle> getOpenCycle() {
        return financialCycleService.getOpenCycle()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialCycle> updateCycle(
            @PathVariable Long id,
            @RequestBody FinancialCycle cycle
    ) {
        return ResponseEntity.ok(
                financialCycleService.updateCycle(id, cycle)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCycle(
            @PathVariable Long id
    ) {
        financialCycleService.deleteCycle(id);

        return ResponseEntity.noContent().build();
    }
}