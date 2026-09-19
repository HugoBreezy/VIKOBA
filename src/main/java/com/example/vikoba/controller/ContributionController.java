package com.example.vikoba.controller;

import com.example.vikoba.entity.Contribution;
import com.example.vikoba.service.ContributionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Contribution> createContribution(
            @RequestBody Contribution contribution
    ) {

        return ResponseEntity.ok(
                contributionService.saveContribution(contribution)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Contribution>> getAllContributions() {

        return ResponseEntity.ok(
                contributionService.getAllContributions()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Contribution> getContributionById(
            @PathVariable Long id
    ) {

        return contributionService.getContributionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Contribution>> getContributionsByMember(
            @PathVariable Long memberId
    ) {

        return ResponseEntity.ok(
                contributionService.getContributionsByMember(memberId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Contribution>> getContributionsByCycle(
            @PathVariable Long cycleId
    ) {

        return ResponseEntity.ok(
                contributionService.getContributionsByCycle(cycleId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}/cycle/{cycleId}/total")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContribution(
            @PathVariable Long id
    ) {

        contributionService.deleteContribution(id);

        return ResponseEntity.noContent().build();
    }
}