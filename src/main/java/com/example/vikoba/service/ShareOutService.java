package com.example.vikoba.service;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.ExpenseRepository;
import com.example.vikoba.repository.LoanRepository;
import com.example.vikoba.repository.ShareOutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final LoanRepository loanRepository;

    public ShareOutService(
            ShareOutRepository shareOutRepository,
            ContributionRepository contributionRepository,
            ExpenseRepository expenseRepository,
            LoanRepository loanRepository
    ) {
        this.shareOutRepository = shareOutRepository;
        this.contributionRepository = contributionRepository;
        this.expenseRepository = expenseRepository;
        this.loanRepository = loanRepository;
    }

    /*
     * Create share-out summary for a financial cycle.
     *
     * Calculations are performed automatically from
     * database records.
     *
     * Total Contributions = SUM(member contributions)
     *
     * Total Loan Interest = SUM(loan interest)
     *
     * Total Expenses = SUM(cycle expenses)
     *
     * Net Profit = Total Loan Interest - Total Expenses
     *
     * Total Share-Out = Total Contributions + Net Profit
     */
    @Transactional
    public ShareOut saveShareOut(ShareOut shareOut) {

        validateShareOut(shareOut);

        Long cycleId = shareOut.getCycle().getId();

        /*
         * One financial cycle can have only one share-out.
         */
        if (shareOutRepository.existsByCycleId(cycleId)) {

            throw new IllegalArgumentException(
                    "Share-out already exists for financial cycle: "
                            + cycleId
            );
        }

        /*
         * Calculate total contributions from database.
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
         * Calculate total loan interest from all
         * loans belonging to this financial cycle.
         *
         * Loan principal is NOT income.
         * Only interest is treated as group income.
         */
        BigDecimal totalLoanInterest =
                loanRepository
                        .findByCycleId(cycleId)
                        .stream()
                        .map(Loan::getInterestAmount)
                        .filter(interest -> interest != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Calculate total expenses from database.
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
         * Net Profit =
         * Total Loan Interest - Total Expenses
         */
        BigDecimal totalProfit =
                totalLoanInterest
                        .subtract(totalExpenses)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * If expenses are greater than income,
         * the cycle has a loss.
         *
         * We do not allow negative profit to reduce
         * members' original contributions.
         */
        if (totalProfit.compareTo(BigDecimal.ZERO) < 0) {

            totalProfit = BigDecimal.ZERO;
        }

        /*
         * Total Share-Out =
         * Contributions + Net Profit
         */
        BigDecimal totalShareOut =
                totalContributions
                        .add(totalProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Set calculated values.
         *
         * Values supplied by the client for these
         * calculated fields are ignored.
         */
        shareOut.setTotalContributions(
                totalContributions
        );

        shareOut.setTotalProfit(
                totalProfit
        );

        shareOut.setTotalExpenses(
                totalExpenses
        );

        shareOut.setTotalShareOut(
                totalShareOut
        );

        /*
         * Automatically set today's date if omitted.
         */
        if (shareOut.getShareOutDate() == null) {

            shareOut.setShareOutDate(
                    LocalDate.now()
            );
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

    public Optional<ShareOut> getShareOutById(
            Long id
    ) {

        return shareOutRepository.findById(id);
    }

    public Optional<ShareOut> getShareOutByCycle(
            Long cycleId
    ) {

        if (cycleId == null) {

            throw new IllegalArgumentException(
                    "Financial cycle ID is required"
            );
        }

        return shareOutRepository.findByCycleId(
                cycleId
        );
    }

    public Optional<ShareOut> getShareOutByCycleAndStatus(
            Long cycleId,
            String status
    ) {

        return shareOutRepository
                .findByCycleIdAndStatus(
                        cycleId,
                        status
                );
    }

    public boolean shareOutExists(
            Long cycleId
    ) {

        return shareOutRepository.existsByCycleId(
                cycleId
        );
    }

    /*
     * Update an existing share-out.
     *
     * Calculated financial values are recalculated
     * from the database instead of trusting request values.
     */
    @Transactional
    public ShareOut updateShareOut(
            Long id,
            ShareOut updatedShareOut
    ) {

        ShareOut existingShareOut =
                shareOutRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out not found with id: "
                                                + id
                                )
                        );

        validateShareOut(updatedShareOut);

        Long cycleId =
                existingShareOut
                        .getCycle()
                        .getId();

        /*
         * Keep the original cycle.
         *
         * A share-out belongs to the cycle under
         * which it was created.
         */
        existingShareOut.setCycle(
                existingShareOut.getCycle()
        );

        /*
         * Recalculate total contributions.
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
         * Recalculate total loan interest.
         */
        BigDecimal totalLoanInterest =
                loanRepository
                        .findByCycleId(cycleId)
                        .stream()
                        .map(Loan::getInterestAmount)
                        .filter(interest -> interest != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        /*
         * Recalculate total expenses.
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
         * Recalculate net profit.
         */
        BigDecimal totalProfit =
                totalLoanInterest
                        .subtract(totalExpenses)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        if (totalProfit.compareTo(BigDecimal.ZERO) < 0) {

            totalProfit = BigDecimal.ZERO;
        }

        /*
         * Recalculate total share-out.
         */
        BigDecimal totalShareOut =
                totalContributions
                        .add(totalProfit)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        existingShareOut.setTotalContributions(
                totalContributions
        );

        existingShareOut.setTotalProfit(
                totalProfit
        );

        existingShareOut.setTotalExpenses(
                totalExpenses
        );

        existingShareOut.setTotalShareOut(
                totalShareOut
        );

        /*
         * Update date only when supplied.
         */
        if (updatedShareOut.getShareOutDate() != null) {

            existingShareOut.setShareOutDate(
                    updatedShareOut.getShareOutDate()
            );
        }

        /*
         * Update status if supplied.
         */
        if (updatedShareOut.getStatus() != null &&
                !updatedShareOut.getStatus().isBlank()) {

            existingShareOut.setStatus(
                    updatedShareOut.getStatus()
                            .toUpperCase()
            );
        }

        /*
         * Update notes.
         */
        existingShareOut.setNotes(
                updatedShareOut.getNotes()
        );

        return shareOutRepository.save(
                existingShareOut
        );
    }

    /*
     * Delete a share-out.
     */
    public void deleteShareOut(
            Long id
    ) {

        if (!shareOutRepository.existsById(id)) {

            throw new IllegalArgumentException(
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

            throw new IllegalArgumentException(
                    "Share-out data cannot be null"
            );
        }

        /*
         * Share-out must belong to a financial cycle.
         */
        if (shareOut.getCycle() == null ||
                shareOut.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is required"
            );
        }

        /*
         * Calculated financial fields are NOT trusted
         * from the client.
         *
         * Therefore we intentionally do not validate:
         *
         * totalContributions
         * totalProfit
         * totalExpenses
         * totalShareOut
         *
         * They are recalculated from database records.
         */

        /*
         * Validate status if supplied.
         */
        if (shareOut.getStatus() != null &&
                !shareOut.getStatus().isBlank()) {

            String status =
                    shareOut.getStatus()
                            .toUpperCase();

            if (!status.equals("PENDING") &&
                    !status.equals("COMPLETED")) {

                throw new IllegalArgumentException(
                        "Invalid share-out status. "
                                + "Allowed values: PENDING, COMPLETED"
                );
            }

            shareOut.setStatus(status);
        }
    }
}