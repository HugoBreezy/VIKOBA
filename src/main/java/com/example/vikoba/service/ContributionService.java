package com.example.vikoba.service;

import com.example.vikoba.entity.Contribution;
import com.example.vikoba.repository.ContributionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ContributionService {

    private final ContributionRepository contributionRepository;

    public ContributionService(
            ContributionRepository contributionRepository
    ) {
        this.contributionRepository = contributionRepository;
    }

    /*
     * Record a new contribution.
     *
     * Each member can contribute any amount
     * during each meeting.
     *
     * There is NO fixed share value.
     */
    public Contribution saveContribution(
            Contribution contribution
    ) {

        validateContribution(contribution);

        /*
         * Automatically use today's date if
         * contribution date is not provided.
         */
        if (contribution.getContributionDate() == null) {
            contribution.setContributionDate(
                    LocalDate.now()
            );
        }

        return contributionRepository.save(
                contribution
        );
    }

    public List<Contribution> getAllContributions() {
        return contributionRepository.findAll();
    }

    public Optional<Contribution> getContributionById(
            Long id
    ) {
        return contributionRepository.findById(id);
    }

    public List<Contribution> getContributionsByMember(
            Long memberId
    ) {

        if (memberId == null) {
            throw new RuntimeException(
                    "Member ID is required"
            );
        }

        return contributionRepository.findByMemberId(
                memberId
        );
    }

    public List<Contribution> getContributionsByCycle(
            Long cycleId
    ) {

        if (cycleId == null) {
            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        return contributionRepository.findByCycleId(
                cycleId
        );
    }

    public List<Contribution> getMemberContributionsByCycle(
            Long memberId,
            Long cycleId
    ) {

        if (memberId == null) {
            throw new RuntimeException(
                    "Member ID is required"
            );
        }

        if (cycleId == null) {
            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        return contributionRepository
                .findByMemberIdAndCycleId(
                        memberId,
                        cycleId
                );
    }

    /*
     * Get total contribution of a member
     * in a financial cycle.
     *
     * This value is used for:
     *
     * Maximum Loan = Contributions × Loan Multiplier
     *
     * and Share-Out calculation.
     */
    public BigDecimal getMemberTotalContribution(
            Long memberId,
            Long cycleId
    ) {

        if (memberId == null) {
            throw new RuntimeException(
                    "Member ID is required"
            );
        }

        if (cycleId == null) {
            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        BigDecimal total =
                contributionRepository
                        .findTotalAmountByMemberIdAndCycleId(
                                memberId,
                                cycleId
                        );

        if (total == null) {
            return BigDecimal.ZERO;
        }

        return total;
    }

    /*
     * Update an existing contribution.
     */
    public Contribution updateContribution(
            Long id,
            Contribution updatedContribution
    ) {

        Contribution existingContribution =
                contributionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Contribution not found with id: "
                                                + id
                                )
                        );

        validateContribution(
                updatedContribution
        );

        existingContribution.setMember(
                updatedContribution.getMember()
        );

        existingContribution.setCycle(
                updatedContribution.getCycle()
        );

        existingContribution.setMeeting(
                updatedContribution.getMeeting()
        );

        existingContribution.setAmount(
                updatedContribution.getAmount()
        );

        existingContribution.setContributionDate(
                updatedContribution.getContributionDate()
        );

        existingContribution.setRecordedBy(
                updatedContribution.getRecordedBy()
        );

        return contributionRepository.save(
                existingContribution
        );
    }

    /*
     * Delete a contribution.
     */
    public void deleteContribution(Long id) {

        if (!contributionRepository.existsById(id)) {

            throw new RuntimeException(
                    "Contribution not found with id: " + id
            );
        }

        contributionRepository.deleteById(id);
    }

    /*
     * Validate contribution information.
     */
    private void validateContribution(
            Contribution contribution
    ) {

        if (contribution == null) {

            throw new RuntimeException(
                    "Contribution data cannot be null"
            );
        }

        /*
         * Member is required.
         */
        if (contribution.getMember() == null ||
                contribution.getMember().getId() == null) {

            throw new RuntimeException(
                    "Member is required"
            );
        }

        /*
         * Financial cycle is required.
         */
        if (contribution.getCycle() == null ||
                contribution.getCycle().getId() == null) {

            throw new RuntimeException(
                    "Financial cycle is required"
            );
        }

        /*
         * Meeting is required.
         */
        if (contribution.getMeeting() == null ||
                contribution.getMeeting().getId() == null) {

            throw new RuntimeException(
                    "Meeting is required"
            );
        }

        /*
         * Contribution amount must be greater than zero.
         *
         * The amount is NOT fixed.
         */
        if (contribution.getAmount() == null ||
                contribution.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Contribution amount must be greater than zero"
            );
        }

        /*
         * Contribution date cannot be in the future.
         */
        if (contribution.getContributionDate() != null &&
                contribution.getContributionDate()
                        .isAfter(LocalDate.now())) {

            throw new RuntimeException(
                    "Contribution date cannot be in the future"
            );
        }
    }
}