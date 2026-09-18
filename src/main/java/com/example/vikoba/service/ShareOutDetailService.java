package com.example.vikoba.service;

import com.example.vikoba.entity.Contribution;
import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.entity.ShareOutDetail;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.ShareOutDetailRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ShareOutDetailService {

    private final ShareOutDetailRepository shareOutDetailRepository;
    private final ContributionRepository contributionRepository;

    public ShareOutDetailService(
            ShareOutDetailRepository shareOutDetailRepository,
            ContributionRepository contributionRepository
    ) {
        this.shareOutDetailRepository = shareOutDetailRepository;
        this.contributionRepository = contributionRepository;
    }

    /*
     * Create share-out detail for a member.
     *
     * Formula:
     *
     * Member Contribution
     * ------------------- = Contribution Percentage
     * Total Contributions
     *
     * Contribution Percentage × Net Profit
     * = Member Profit
     *
     * Member Contribution + Member Profit
     * = Member Share-Out
     */
    public ShareOutDetail saveShareOutDetail(
            ShareOutDetail detail
    ) {

        validateDetail(detail);

        ShareOut shareOut = detail.getShareOut();

        Long shareOutId = shareOut.getId();
        Long memberId = detail.getMember().getId();
        Long cycleId = shareOut.getCycle().getId();

        /*
         * One member can only have one detail
         * in the same share-out.
         */
        if (shareOutDetailRepository
                .findByShareOutIdAndMemberId(
                        shareOutId,
                        memberId
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Share-out detail already exists for this member"
            );
        }

        /*
         * Get member's total contribution
         * during the financial cycle.
         */
        BigDecimal memberContribution =
                contributionRepository
                        .findTotalAmountByMemberIdAndCycleId(
                                memberId,
                                cycleId
                        );

        if (memberContribution == null) {
            memberContribution = BigDecimal.ZERO;
        }

        memberContribution =
                memberContribution.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        if (memberContribution.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Member has no contribution in this financial cycle"
            );
        }

        /*
         * Get total contributions recorded
         * in this financial cycle.
         */
        BigDecimal totalContributions =
                shareOut.getTotalContributions();

        if (totalContributions == null ||
                totalContributions.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Total contributions must be greater than zero"
            );
        }

        /*
         * Calculate contribution percentage.
         *
         * Example:
         *
         * Member = 500,000
         * Total = 1,000,000
         *
         * Percentage = 0.50 = 50%
         */
        BigDecimal contributionPercentage =
                memberContribution
                        .divide(
                                totalContributions,
                                4,
                                RoundingMode.HALF_UP
                        );

        /*
         * Get net profit available for distribution.
         */
        BigDecimal netProfit =
                shareOut.getTotalProfit();

        if (netProfit == null) {
            netProfit = BigDecimal.ZERO;
        }

        /*
         * Member profit =
         * contribution percentage × net profit.
         */
        BigDecimal memberProfit =
                contributionPercentage
                        .multiply(netProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Member share-out =
         * contribution + member profit.
         */
        BigDecimal shareOutAmount =
                memberContribution
                        .add(memberProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        detail.setMemberContribution(
                memberContribution
        );

        detail.setContributionPercentage(
                contributionPercentage
        );

        detail.setMemberProfit(
                memberProfit
        );

        detail.setShareOutAmount(
                shareOutAmount
        );

        /*
         * New share-out detail starts as PENDING.
         */
        if (detail.getPaymentStatus() == null ||
                detail.getPaymentStatus().isBlank()) {

            detail.setPaymentStatus("PENDING");
        }

        return shareOutDetailRepository.save(detail);
    }

    public List<ShareOutDetail> getAllShareOutDetails() {
        return shareOutDetailRepository.findAll();
    }

    public Optional<ShareOutDetail> getShareOutDetailById(
            Long id
    ) {
        return shareOutDetailRepository.findById(id);
    }

    public List<ShareOutDetail> getDetailsByShareOut(
            Long shareOutId
    ) {
        return shareOutDetailRepository.findByShareOutId(
                shareOutId
        );
    }

    public List<ShareOutDetail> getDetailsByMember(
            Long memberId
    ) {
        return shareOutDetailRepository.findByMemberId(
                memberId
        );
    }

    public Optional<ShareOutDetail> getMemberShareOutDetail(
            Long shareOutId,
            Long memberId
    ) {
        return shareOutDetailRepository
                .findByShareOutIdAndMemberId(
                        shareOutId,
                        memberId
                );
    }

    public List<ShareOutDetail> getDetailsByPaymentStatus(
            String paymentStatus
    ) {
        return shareOutDetailRepository
                .findByPaymentStatus(paymentStatus);
    }

    /*
     * Update an existing share-out detail.
     */
    public ShareOutDetail updateShareOutDetail(
            Long id,
            ShareOutDetail updatedDetail
    ) {

        ShareOutDetail existingDetail =
                shareOutDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share-out detail not found with id: "
                                                + id
                                )
                        );

        validateDetail(updatedDetail);

        existingDetail.setShareOut(
                updatedDetail.getShareOut()
        );

        existingDetail.setMember(
                updatedDetail.getMember()
        );

        existingDetail.setMemberContribution(
                updatedDetail.getMemberContribution()
        );

        existingDetail.setContributionPercentage(
                updatedDetail.getContributionPercentage()
        );

        existingDetail.setMemberProfit(
                updatedDetail.getMemberProfit()
        );

        existingDetail.setShareOutAmount(
                updatedDetail.getShareOutAmount()
        );

        existingDetail.setPaymentStatus(
                updatedDetail.getPaymentStatus()
        );

        existingDetail.setPaidDate(
                updatedDetail.getPaidDate()
        );

        existingDetail.setNotes(
                updatedDetail.getNotes()
        );

        return shareOutDetailRepository.save(
                existingDetail
        );
    }

    /*
     * Mark a member's share-out as paid.
     */
    public ShareOutDetail markAsPaid(Long id) {

        ShareOutDetail detail =
                shareOutDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share-out detail not found with id: "
                                                + id
                                )
                        );

        detail.setPaymentStatus("PAID");
        detail.setPaidDate(LocalDate.now());

        return shareOutDetailRepository.save(detail);
    }

    /*
     * Delete share-out detail.
     */
    public void deleteShareOutDetail(Long id) {

        if (!shareOutDetailRepository.existsById(id)) {

            throw new RuntimeException(
                    "Share-out detail not found with id: " + id
            );
        }

        shareOutDetailRepository.deleteById(id);
    }

    /*
     * Validate share-out detail.
     */
    private void validateDetail(
            ShareOutDetail detail
    ) {

        if (detail == null) {

            throw new RuntimeException(
                    "Share-out detail cannot be null"
            );
        }

        /*
         * Share-out is required.
         */
        if (detail.getShareOut() == null ||
                detail.getShareOut().getId() == null) {

            throw new RuntimeException(
                    "Share-out is required"
            );
        }

        /*
         * Member is required.
         */
        if (detail.getMember() == null ||
                detail.getMember().getId() == null) {

            throw new RuntimeException(
                    "Member is required"
            );
        }

        /*
         * Payment status must be valid if supplied.
         */
        if (detail.getPaymentStatus() != null &&
                detail.getPaymentStatus().isBlank()) {

            detail.setPaymentStatus("PENDING");
        }
    }
}