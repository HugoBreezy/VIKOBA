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
            throw new IllegalArgumentException(
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
            throw new IllegalArgumentException(
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
            throw new IllegalArgumentException(
                    "Member ID is required"
            );
        }

        if (cycleId == null) {
            throw new IllegalArgumentException(
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
     * Maximum Loan = Contributions × Loan Multiplier
     *
     * This value is also used for
     * Share-Out calculation.
     */
    public BigDecimal getMemberTotalContribution(
            Long memberId,
            Long cycleId
    ) {

        if (memberId == null) {
            throw new IllegalArgumentException(
                    "Member ID is required"
            );
        }

        if (cycleId == null) {
            throw new IllegalArgumentException(
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
                                new IllegalArgumentException(
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

        /*
         * If no date is supplied during update,
         * keep the existing contribution date.
         */
        if (updatedContribution.getContributionDate() != null) {

            existingContribution.setContributionDate(
                    updatedContribution.getContributionDate()
            );
        }

        /*
         * Do NOT allow recordedBy to be changed
         * through the update request.
         *
         * The original recorder remains attached
         * to this contribution.
         */

        return contributionRepository.save(
                existingContribution
        );
    }

    /*
     * Delete a contribution.
     */
    public void deleteContribution(Long id) {

        if (!contributionRepository.existsById(id)) {

            throw new IllegalArgumentException(
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

            throw new IllegalArgumentException(
                    "Contribution data cannot be null"
            );
        }

        /*
         * Member is required.
         */
        if (contribution.getMember() == null ||
                contribution.getMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Member is required"
            );
        }

        /*
         * Financial cycle is required.
         */
        if (contribution.getCycle() == null ||
                contribution.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is required"
            );
        }

        /*
         * Meeting is required.
         */
        if (contribution.getMeeting() == null ||
                contribution.getMeeting().getId() == null) {

            throw new IllegalArgumentException(
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

            throw new IllegalArgumentException(
                    "Contribution amount must be greater than zero"
            );
        }

        /*
         * Contribution date cannot be in the future.
         */
        if (contribution.getContributionDate() != null &&
                contribution.getContributionDate()
                        .isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Contribution date cannot be in the future"
            );
        }
    }
}