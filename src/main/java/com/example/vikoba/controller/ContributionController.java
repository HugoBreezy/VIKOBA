package com.example.vikoba.controller;

import com.example.vikoba.entity.Contribution;
import com.example.vikoba.service.ContributionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@CrossOrigin(origins = "*")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(
            ContributionService contributionService
    ) {
        this.contributionService = contributionService;
    }

    @PostMapping
    public ResponseEntity<Contribution> createContribution(
            @RequestBody Contribution contribution
    ) {
        return ResponseEntity.ok(
                contributionService.saveContribution(contribution)
        );
    }

    @GetMapping
    public ResponseEntity<List<Contribution>> getAllContributions() {
        return ResponseEntity.ok(
                contributionService.getAllContributions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contribution> getContributionById(
            @PathVariable Long id
    ) {
        return contributionService.getContributionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Contribution>> getContributionsByMember(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(
                contributionService.getContributionsByMember(memberId)
        );
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<Contribution>> getContributionsByCycle(
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                contributionService.getContributionsByCycle(cycleId)
        );
    }

    @GetMapping("/member/{memberId}/cycle/{cycleId}")
    public ResponseEntity<List<Contribution>>
    getMemberContributionsByCycle(
            @PathVariable Long memberId,
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                contributionService.getMemberContributionsByCycle(
                        memberId,
                        cycleId
                )
        );
    }

    @GetMapping("/member/{memberId}/cycle/{cycleId}/total")
    public ResponseEntity<BigDecimal> getMemberTotalContribution(
            @PathVariable Long memberId,
            @PathVariable Long cycleId
    ) {
        return ResponseEntity.ok(
                contributionService.getMemberTotalContribution(
                        memberId,
                        cycleId
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contribution> updateContribution(
            @PathVariable Long id,
            @RequestBody Contribution contribution
    ) {
        return ResponseEntity.ok(
                contributionService.updateContribution(
                        id,
                        contribution
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContribution(
            @PathVariable Long id
    ) {
        contributionService.deleteContribution(id);

        return ResponseEntity.noContent().build();
    }
}