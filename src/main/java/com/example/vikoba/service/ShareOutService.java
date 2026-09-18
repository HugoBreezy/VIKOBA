package com.example.vikoba.service;

import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.ExpenseRepository;
import com.example.vikoba.repository.ShareOutRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ShareOutService {

    private final ShareOutRepository shareOutRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;

    public ShareOutService(
            ShareOutRepository shareOutRepository,
            ContributionRepository contributionRepository,
            ExpenseRepository expenseRepository
    ) {
        this.shareOutRepository = shareOutRepository;
        this.contributionRepository = contributionRepository;
        this.expenseRepository = expenseRepository;
    }

    /*
     * Create a share-out summary for a financial cycle.
     *
     * Total Contributions = all member contributions
     * in the financial cycle.
     *
     * Total Expenses = all expenses in the cycle.
     *
     * Total Profit must represent the net profit
     * available for distribution.
     *
     * Note:
     * Loan interest is group income and will be included
     * when the income calculation is implemented.
     */
    public ShareOut saveShareOut(ShareOut shareOut) {

        validateShareOut(shareOut);

        Long cycleId = shareOut.getCycle().getId();

        /*
         * A financial cycle can have only one share-out.
         */
        if (shareOutRepository.existsByCycleId(cycleId)) {

            throw new RuntimeException(
                    "Share-out already exists for financial cycle: "
                            + cycleId
            );
        }

        /*
         * Calculate total contributions from the database.
         */
        BigDecimal totalContributions =
                contributionRepository
                        .findByCycleId(cycleId)
                        .stream()
                        .map(contribution ->
                                contribution.getAmount()
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Calculate total expenses from the database.
         */
        BigDecimal totalExpenses =
                expenseRepository
                        .findByCycleId(cycleId)
                        .stream()
                        .map(expense ->
                                expense.getAmount()
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * At this stage, totalProfit is expected to be
         * supplied by the income calculation logic.
         *
         * We do not invent an income amount here.
         *
         * The final net profit calculation will be:
         *
         * Net Profit = Total Income - Total Expenses
         */
        BigDecimal totalProfit =
                shareOut.getTotalProfit();

        if (totalProfit == null) {
            totalProfit = BigDecimal.ZERO;
        }

        totalProfit =
                totalProfit.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Share-out amount =
         * contributions + net profit.
         */
        BigDecimal totalShareOut =
                totalContributions
                        .add(totalProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        shareOut.setTotalContributions(
                totalContributions
        );

        shareOut.setTotalExpenses(
                totalExpenses
        );

        shareOut.setTotalProfit(
                totalProfit
        );

        shareOut.setTotalShareOut(
                totalShareOut
        );

        /*
         * Automatically use today's date if not provided.
         */
        if (shareOut.getShareOutDate() == null) {
            shareOut.setShareOutDate(LocalDate.now());
        }

        /*
         * New share-out starts as PENDING.
         */
        if (shareOut.getStatus() == null ||
                shareOut.getStatus().isBlank()) {

            shareOut.setStatus("PENDING");
        }

        return shareOutRepository.save(shareOut);
    }

    public List<ShareOut> getAllShareOuts() {
        return shareOutRepository.findAll();
    }

    public Optional<ShareOut> getShareOutById(Long id) {
        return shareOutRepository.findById(id);
    }

    public Optional<ShareOut> getShareOutByCycle(Long cycleId) {

        if (cycleId == null) {
            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        return shareOutRepository.findByCycleId(cycleId);
    }

    public Optional<ShareOut> getShareOutByCycleAndStatus(
            Long cycleId,
            String status
    ) {
        return shareOutRepository.findByCycleIdAndStatus(
                cycleId,
                status
        );
    }

    public boolean shareOutExists(Long cycleId) {
        return shareOutRepository.existsByCycleId(cycleId);
    }

    /*
     * Update an existing share-out.
     */
    public ShareOut updateShareOut(
            Long id,
            ShareOut updatedShareOut
    ) {

        ShareOut existingShareOut =
                shareOutRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Share-out not found with id: "
                                                + id
                                )
                        );

        validateShareOut(updatedShareOut);

        existingShareOut.setCycle(
                updatedShareOut.getCycle()
        );

        existingShareOut.setTotalContributions(
                updatedShareOut.getTotalContributions()
        );

        existingShareOut.setTotalProfit(
                updatedShareOut.getTotalProfit()
        );

        existingShareOut.setTotalExpenses(
                updatedShareOut.getTotalExpenses()
        );

        existingShareOut.setTotalShareOut(
                updatedShareOut.getTotalShareOut()
        );

        existingShareOut.setShareOutDate(
                updatedShareOut.getShareOutDate()
        );

        existingShareOut.setStatus(
                updatedShareOut.getStatus()
        );

        existingShareOut.setNotes(
                updatedShareOut.getNotes()
        );

        return shareOutRepository.save(existingShareOut);
    }

    /*
     * Delete a share-out.
     */
    public void deleteShareOut(Long id) {

        if (!shareOutRepository.existsById(id)) {

            throw new RuntimeException(
                    "Share-out not found with id: " + id
            );
        }

        shareOutRepository.deleteById(id);
    }

    /*
     * Validate share-out information.
     */
    private void validateShareOut(
            ShareOut shareOut
    ) {

        if (shareOut == null) {

            throw new RuntimeException(
                    "Share-out data cannot be null"
            );
        }

        /*
         * Share-out must belong to a financial cycle.
         */
        if (shareOut.getCycle() == null ||
                shareOut.getCycle().getId() == null) {

            throw new RuntimeException(
                    "Financial cycle is required"
            );
        }

        /*
         * If values are supplied manually,
         * they cannot be negative.
         */
        if (shareOut.getTotalContributions() != null &&
                shareOut.getTotalContributions()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Total contributions cannot be negative"
            );
        }

        if (shareOut.getTotalProfit() != null &&
                shareOut.getTotalProfit()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Total profit cannot be negative"
            );
        }

        if (shareOut.getTotalExpenses() != null &&
                shareOut.getTotalExpenses()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Total expenses cannot be negative"
            );
        }

        if (shareOut.getTotalShareOut() != null &&
                shareOut.getTotalShareOut()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Total share-out cannot be negative"
            );
        }
    }
}