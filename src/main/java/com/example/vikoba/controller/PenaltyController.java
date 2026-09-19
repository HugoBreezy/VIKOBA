package com.example.vikoba.controller;

import com.example.vikoba.entity.Penalty;
import com.example.vikoba.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@CrossOrigin(origins = "*")
public class PenaltyController {

    private final PenaltyService penaltyService;

    public PenaltyController(
            PenaltyService penaltyService
    ) {
        this.penaltyService = penaltyService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> createPenalty(
            @RequestBody Penalty penalty
    ) {
        return ResponseEntity.ok(
                penaltyService.savePenalty(penalty)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Penalty>> getAllPenalties() {
        return ResponseEntity.ok(
                penaltyService.getAllPenalties()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Penalty> getPenaltyById(
            @PathVariable Long id
    ) {
        return penaltyService.getPenaltyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/installment/{installmentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Penalty>> getPenaltiesByInstallment(
            @PathVariable Long installmentId
    ) {
        return ResponseEntity.ok(
                penaltyService.getPenaltiesByInstallment(
                        installmentId
                )
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/installment/{installmentId}/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Penalty>
    getPenaltyByInstallmentAndStatus(
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

    /*
     * USER + ADMIN
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Penalty>> getPenaltiesByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                penaltyService.getPenaltiesByStatus(status)
        );
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Penalty> updatePenalty(
            @PathVariable Long id,
            @RequestBody Penalty penalty
    ) {
        return ResponseEntity.ok(
                penaltyService.updatePenalty(id, penalty)
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePenalty(
            @PathVariable Long id
    ) {
        penaltyService.deletePenalty(id);

        return ResponseEntity.noContent().build();
    }
}