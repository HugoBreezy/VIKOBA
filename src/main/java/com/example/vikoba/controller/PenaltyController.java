package com.example.vikoba.controller;

import com.example.vikoba.entity.Penalty;
import com.example.vikoba.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@CrossOrigin(origins = "*")
public class PenaltyController {

    private final PenaltyService penaltyService;

    public PenaltyController(PenaltyService penaltyService) {
        this.penaltyService = penaltyService;
    }

    @PostMapping
    public ResponseEntity<Penalty> createPenalty(
            @RequestBody Penalty penalty
    ) {
        return ResponseEntity.ok(
                penaltyService.savePenalty(penalty)
        );
    }

    @GetMapping
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        return ResponseEntity.ok(
                penaltyService.getAllPenalties()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Penalty> getPenaltyById(
            @PathVariable Long id
    ) {
        return penaltyService.getPenaltyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/installment/{installmentId}")
    public ResponseEntity<List<Penalty>> getPenaltiesByInstallment(
            @PathVariable Long installmentId
    ) {
        return ResponseEntity.ok(
                penaltyService.getPenaltiesByInstallment(
                        installmentId
                )
        );
    }

    @GetMapping("/installment/{installmentId}/status/{status}")
    public ResponseEntity<Penalty> getPenaltyByInstallmentAndStatus(
            @PathVariable Long installmentId,
            @PathVariable String status
    ) {
        return penaltyService
                .getPenaltyByInstallmentAndStatus(
                        installmentId,
                        status
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Penalty>> getPenaltiesByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                penaltyService.getPenaltiesByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Penalty> updatePenalty(
            @PathVariable Long id,
            @RequestBody Penalty penalty
    ) {
        return ResponseEntity.ok(
                penaltyService.updatePenalty(id, penalty)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePenalty(
            @PathVariable Long id
    ) {
        penaltyService.deletePenalty(id);

        return ResponseEntity.noContent().build();
    }
}