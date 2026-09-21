package com.example.vikoba.service;

import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.entity.ShareOutDetail;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.ShareOutDetailRepository;
import com.example.vikoba.repository.ShareOutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ShareOutDetailService {

    private final ShareOutDetailRepository shareOutDetailRepository;
    private final ContributionRepository contributionRepository;
    private final ShareOutRepository shareOutRepository;

    public ShareOutDetailService(
            ShareOutDetailRepository shareOutDetailRepository,
            ContributionRepository contributionRepository,
            ShareOutRepository shareOutRepository
    ) {
        this.shareOutDetailRepository = shareOutDetailRepository;
        this.contributionRepository = contributionRepository;
        this.shareOutRepository = shareOutRepository;
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
     * Member Contribution
     * ------------------- × Net Profit = Member Profit
     * Total Contributions
     *
     * Member Contribution + Member Profit
     * = Member Share-Out
     */
    @Transactional
    public ShareOutDetail saveShareOutDetail(
            ShareOutDetail detail
    ) {

        validateDetail(detail);

        Long shareOutId = detail.getShareOut().getId();
        Long memberId = detail.getMember().getId();

        /*
         * Get the complete ShareOut from database.
         */
        ShareOut shareOut =
                shareOutRepository.findById(shareOutId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out not found with id: "
                                                + shareOutId
                                )
                        );

        /*
         * Get financial cycle from the real ShareOut.
         */
        if (shareOut.getCycle() == null ||
                shareOut.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is not assigned to this share-out"
            );
        }

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

            throw new IllegalArgumentException(
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

        if (memberContribution.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "Member has no contribution in this financial cycle"
            );
        }

        /*
         * Get total contributions from the actual ShareOut.
         */
        BigDecimal totalContributions =
                shareOut.getTotalContributions();

        if (totalContributions == null ||
                totalContributions.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new IllegalArgumentException(
                    "Total contributions must be greater than zero"
            );
        }

        totalContributions =
                totalContributions.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Calculate contribution percentage ONLY for display.
         *
         * Example:
         *
         * 50,000 / 90,000
         * = 0.555555...
         *
         * Stored/displayed as:
         * 0.5556
         */
        BigDecimal contributionPercentage =
                memberContribution.divide(
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

        netProfit =
                netProfit.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * IMPORTANT:
         *
         * Do NOT use the rounded contributionPercentage
         * to calculate the member profit.
         *
         * Wrong:
         *
         * 0.5556 × 12,000 = 6,667.20
         *
         * Correct:
         *
         * 50,000 × 12,000 / 90,000
         * = 6,666.666...
         * = 6,666.67
         */
        BigDecimal memberProfit =
                memberContribution
                        .multiply(netProfit)
                        .divide(
                                totalContributions,
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

        /*
         * Use the real ShareOut entity from database.
         */
        detail.setShareOut(shareOut);

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

        } else {

            detail.setPaymentStatus(
                    detail.getPaymentStatus().toUpperCase()
            );
        }

        /*
         * A new PENDING detail must not have
         * a paid date.
         */
        if ("PENDING".equalsIgnoreCase(
                detail.getPaymentStatus()
        )) {
            detail.setPaidDate(null);
        }

        /*
         * If a new detail is marked PAID and no
         * paid date was supplied, use today's date.
         */
        if ("PAID".equalsIgnoreCase(
                detail.getPaymentStatus()
        ) &&
                detail.getPaidDate() == null) {

            detail.setPaidDate(LocalDate.now());
        }

        return shareOutDetailRepository.save(detail);
    }

    // ============================================================
    // GET ALL SHARE-OUT DETAILS
    // ============================================================

    public List<ShareOutDetail> getAllShareOutDetails() {

        return shareOutDetailRepository.findAll();
    }

    // ============================================================
    // GET SHARE-OUT DETAIL BY ID
    // ============================================================

    public Optional<ShareOutDetail> getShareOutDetailById(
            Long id
    ) {

        return shareOutDetailRepository.findById(id);
    }

    // ============================================================
    // GET DETAILS BY SHARE-OUT
    // ============================================================

    public List<ShareOutDetail> getDetailsByShareOut(
            Long shareOutId
    ) {

        return shareOutDetailRepository.findByShareOutId(
                shareOutId
        );
    }

    // ============================================================
    // GET DETAILS BY MEMBER
    // ============================================================

    public List<ShareOutDetail> getDetailsByMember(
            Long memberId
    ) {

        return shareOutDetailRepository.findByMemberId(
                memberId
        );
    }

    // ============================================================
    // GET MEMBER SHARE-OUT DETAIL
    // ============================================================

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

    // ============================================================
    // GET DETAILS BY PAYMENT STATUS
    // ============================================================

    public List<ShareOutDetail> getDetailsByPaymentStatus(
            String paymentStatus
    ) {

        return shareOutDetailRepository
                .findByPaymentStatus(paymentStatus);
    }

    /*
     * Update an existing share-out detail.
     *
     * Calculated financial values are recalculated
     * from database instead of trusting the client.
     */
    @Transactional
    public ShareOutDetail updateShareOutDetail(
            Long id,
            ShareOutDetail updatedDetail
    ) {

        ShareOutDetail existingDetail =
                shareOutDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out detail not found with id: "
                                                + id
                                )
                        );

        validateDetail(updatedDetail);

        Long shareOutId =
                updatedDetail.getShareOut().getId();

        Long memberId =
                updatedDetail.getMember().getId();

        ShareOut shareOut =
                shareOutRepository.findById(shareOutId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out not found with id: "
                                                + shareOutId
                                )
                        );

        if (shareOut.getCycle() == null ||
                shareOut.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is not assigned to this share-out"
            );
        }

        Long cycleId =
                shareOut.getCycle().getId();

        /*
         * If the member/share-out relationship is being changed,
         * make sure another detail does not already exist.
         */
        Optional<ShareOutDetail> duplicate =
                shareOutDetailRepository
                        .findByShareOutIdAndMemberId(
                                shareOutId,
                                memberId
                        );

        if (duplicate.isPresent() &&
                !duplicate.get().getId().equals(id)) {

            throw new IllegalArgumentException(
                    "Share-out detail already exists for this member"
            );
        }

        /*
         * Recalculate member contribution.
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

        if (memberContribution.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "Member has no contribution in this financial cycle"
            );
        }

        /*
         * Get total contributions.
         */
        BigDecimal totalContributions =
                shareOut.getTotalContributions();

        if (totalContributions == null ||
                totalContributions.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new IllegalArgumentException(
                    "Total contributions must be greater than zero"
            );
        }

        totalContributions =
                totalContributions.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Calculate percentage for display.
         */
        BigDecimal contributionPercentage =
                memberContribution.divide(
                        totalContributions,
                        4,
                        RoundingMode.HALF_UP
                );

        /*
         * Get profit.
         */
        BigDecimal netProfit =
                shareOut.getTotalProfit();

        if (netProfit == null) {
            netProfit = BigDecimal.ZERO;
        }

        netProfit =
                netProfit.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * IMPORTANT:
         *
         * Calculate profit using the exact contribution
         * ratio instead of the rounded percentage.
         */
        BigDecimal memberProfit =
                memberContribution
                        .multiply(netProfit)
                        .divide(
                                totalContributions,
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Calculate final share-out amount.
         */
        BigDecimal shareOutAmount =
                memberContribution
                        .add(memberProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        existingDetail.setShareOut(shareOut);

        existingDetail.setMember(
                updatedDetail.getMember()
        );

        existingDetail.setMemberContribution(
                memberContribution
        );

        existingDetail.setContributionPercentage(
                contributionPercentage
        );

        existingDetail.setMemberProfit(
                memberProfit
        );

        existingDetail.setShareOutAmount(
                shareOutAmount
        );

        /*
         * Update payment status only if supplied.
         */
        if (updatedDetail.getPaymentStatus() != null &&
                !updatedDetail.getPaymentStatus().isBlank()) {

            String newPaymentStatus =
                    updatedDetail
                            .getPaymentStatus()
                            .toUpperCase();

            existingDetail.setPaymentStatus(
                    newPaymentStatus
            );

            /*
             * If status becomes PENDING,
             * paidDate must be cleared.
             */
            if ("PENDING".equals(newPaymentStatus)) {

                existingDetail.setPaidDate(null);

            } else if ("PAID".equals(newPaymentStatus)) {

                /*
                 * If marked PAID and no date was supplied,
                 * use today.
                 */
                if (updatedDetail.getPaidDate() != null) {

                    existingDetail.setPaidDate(
                            updatedDetail.getPaidDate()
                    );

                } else if (existingDetail.getPaidDate() == null) {

                    existingDetail.setPaidDate(
                            LocalDate.now()
                    );
                }
            }

        } else {

            /*
             * If no payment status was supplied,
             * preserve the existing payment status.
             */
            if ("PENDING".equalsIgnoreCase(
                    existingDetail.getPaymentStatus()
            )) {

                existingDetail.setPaidDate(null);
            }
        }

        /*
         * Notes.
         */
        existingDetail.setNotes(
                updatedDetail.getNotes()
        );

        return shareOutDetailRepository.save(
                existingDetail
        );
    }

    /*
     * Mark a member's share-out as paid.
     *
     * After marking the member as PAID, check all details
     * belonging to the same ShareOut.
     *
     * If every member has been paid:
     * ShareOut = COMPLETED
     *
     * If at least one member is still pending:
     * ShareOut = PENDING
     */
    @Transactional
    public ShareOutDetail markAsPaid(Long id) {

        ShareOutDetail detail =
                shareOutDetailRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out detail not found with id: "
                                                + id
                                )
                        );

        /*
         * Mark this member as PAID.
         */
        detail.setPaymentStatus("PAID");
        detail.setPaidDate(LocalDate.now());

        ShareOut shareOut = detail.getShareOut();

        if (shareOut == null ||
                shareOut.getId() == null) {

            throw new IllegalArgumentException(
                    "Share-out is not assigned to this detail"
            );
        }

        Long shareOutId = shareOut.getId();

        /*
         * Get all members belonging to this share-out.
         */
        List<ShareOutDetail> details =
                shareOutDetailRepository.findByShareOutId(
                        shareOutId
                );

        /*
         * Check whether every member has been paid.
         */
        boolean allPaid =
                !details.isEmpty() &&
                        details.stream()
                                .allMatch(item ->
                                        "PAID".equalsIgnoreCase(
                                                item.getPaymentStatus()
                                        )
                                );

        /*
         * Update the main ShareOut status.
         */
        if (allPaid) {

            shareOut.setStatus("COMPLETED");

        } else {

            shareOut.setStatus("PENDING");
        }

        shareOutRepository.save(shareOut);

        /*
         * Save member payment.
         */
        return shareOutDetailRepository.save(detail);
    }

    /*
     * Delete share-out detail.
     */
    public void deleteShareOutDetail(Long id) {

        if (!shareOutDetailRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Share-out detail not found with id: "
                            + id
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

            throw new IllegalArgumentException(
                    "Share-out detail cannot be null"
            );
        }

        /*
         * Share-out is required.
         */
        if (detail.getShareOut() == null ||
                detail.getShareOut().getId() == null) {

            throw new IllegalArgumentException(
                    "Share-out is required"
            );
        }

        /*
         * Member is required.
         */
        if (detail.getMember() == null ||
                detail.getMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Member is required"
            );
        }

        /*
         * Payment status validation.
         */
        if (detail.getPaymentStatus() != null) {

            String status =
                    detail.getPaymentStatus()
                            .toUpperCase();

            if (!status.equals("PENDING") &&
                    !status.equals("PAID")) {

                throw new IllegalArgumentException(
                        "Invalid payment status. " +
                                "Allowed values: PENDING, PAID"
                );
            }

            detail.setPaymentStatus(status);
        }
    }
}