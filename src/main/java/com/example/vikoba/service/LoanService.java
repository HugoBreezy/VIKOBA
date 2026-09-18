package com.example.vikoba.service;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.LoanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final ContributionRepository contributionRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final SystemSettingService systemSettingService;

    public LoanService(
            LoanRepository loanRepository,
            ContributionRepository contributionRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            SystemSettingService systemSettingService
    ) {
        this.loanRepository = loanRepository;
        this.contributionRepository = contributionRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.systemSettingService = systemSettingService;
    }

    /*
     * Create Loan
     *
     * Business rules:
     * 1. Maximum loan = total contributions × loan multiplier
     * 2. Interest is calculated from the interest rate supplied
     * 3. Maximum repayment period comes from MAX_LOAN_WEEKS setting
     * 4. Loan is divided into installments from MAX_LOAN_INSTALLMENTS setting
     */
    public Loan saveLoan(Loan loan) {

        validateLoan(loan);

        Long memberId = loan.getMember().getId();
        Long cycleId = loan.getCycle().getId();

        /*
         * Get total contributions made by this member
         * during the current financial cycle.
         */
        BigDecimal totalContributions =
                contributionRepository
                        .findTotalAmountByMemberIdAndCycleId(
                                memberId,
                                cycleId
                        );

        if (totalContributions == null) {
            totalContributions = BigDecimal.ZERO;
        }

        /*
         * Get loan multiplier from system settings.
         *
         * Example:
         * contributions = 500,000
         * multiplier = 3
         * maximum loan = 1,500,000
         */
        BigDecimal loanMultiplier =
                systemSettingService.getDecimalSetting(
                        "LOAN_MULTIPLIER"
                );

        BigDecimal maximumLoan =
                totalContributions
                        .multiply(loanMultiplier)
                        .setScale(2, RoundingMode.HALF_UP);

        if (loan.getPrincipalAmount().compareTo(maximumLoan) > 0) {

            throw new RuntimeException(
                    "Loan amount exceeds the member's maximum loan limit. "
                            + "Maximum allowed: "
                            + maximumLoan
            );
        }

        /*
         * Get maximum loan repayment period from settings.
         */
        int maxLoanWeeks =
                systemSettingService.getIntSetting(
                        "MAX_LOAN_WEEKS"
                );

        /*
         * Get maximum number of loan installments from settings.
         */
        int maxLoanInstallments =
                systemSettingService.getIntSetting(
                        "MAX_LOAN_INSTALLMENTS"
                );

        /*
         * Validate loan settings.
         */
        if (maxLoanWeeks <= 0) {
            throw new RuntimeException(
                    "MAX_LOAN_WEEKS must be greater than zero"
            );
        }

        if (maxLoanInstallments <= 0) {
            throw new RuntimeException(
                    "MAX_LOAN_INSTALLMENTS must be greater than zero"
            );
        }

        /*
         * Calculate interest.
         *
         * Example:
         * Principal = 1,000,000
         * Interest rate = 10%
         * Interest = 100,000
         */
        BigDecimal interestAmount =
                loan.getPrincipalAmount()
                        .multiply(loan.getInterestRate())
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal totalAmount =
                loan.getPrincipalAmount()
                        .add(interestAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        /*
         * Loan date
         */
        if (loan.getLoanDate() == null) {
            loan.setLoanDate(LocalDate.now());
        }

        /*
         * Maximum loan repayment period comes from
         * MAX_LOAN_WEEKS setting.
         */
        LocalDate dueDate =
                loan.getLoanDate()
                        .plusWeeks(maxLoanWeeks);

        loan.setDueDate(dueDate);

        loan.setInterestAmount(interestAmount);
        loan.setTotalAmount(totalAmount);
        loan.setStatus("ACTIVE");

        /*
         * Save loan first so that we get the generated ID.
         */
        Loan savedLoan = loanRepository.save(loan);

        /*
         * Generate installments using the configured
         * MAX_LOAN_INSTALLMENTS setting.
         */
        createInstallments(
                savedLoan,
                maxLoanInstallments
        );

        return savedLoan;
    }

    /*
     * Create weekly installments for a loan.
     */
    private void createInstallments(
            Loan loan,
            int maxLoanInstallments
    ) {

        BigDecimal totalAmount = loan.getTotalAmount();

        /*
         * Normal weekly installment.
         */
        BigDecimal weeklyAmount =
                totalAmount
                        .divide(
                                BigDecimal.valueOf(maxLoanInstallments),
                                2,
                                RoundingMode.DOWN
                        );

        BigDecimal totalCreated = BigDecimal.ZERO;

        for (int i = 1; i <= maxLoanInstallments; i++) {

            LoanInstallment installment =
                    new LoanInstallment();

            installment.setLoan(loan);
            installment.setInstallmentNumber(i);

            /*
             * Each installment is due one week after
             * the previous installment.
             */
            installment.setDueDate(
                    loan.getLoanDate().plusWeeks(i)
            );

            BigDecimal installmentAmount;

            /*
             * The final installment receives the remaining
             * amount so that all installments add up exactly
             * to the total loan amount.
             */
            if (i == maxLoanInstallments) {

                installmentAmount =
                        totalAmount
                                .subtract(totalCreated)
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                );

            } else {

                installmentAmount = weeklyAmount;
            }

            installment.setAmount(installmentAmount);
            installment.setStatus("PENDING");

            loanInstallmentRepository.save(installment);

            totalCreated =
                    totalCreated.add(installmentAmount);
        }
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Optional<Loan> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    public List<Loan> getLoansByMember(Long memberId) {
        return loanRepository.findByMemberId(memberId);
    }

    public List<Loan> getLoansByCycle(Long cycleId) {
        return loanRepository.findByCycleId(cycleId);
    }

    public List<Loan> getMemberLoansByCycle(
            Long memberId,
            Long cycleId
    ) {
        return loanRepository.findByMemberIdAndCycleId(
                memberId,
                cycleId
        );
    }

    public List<Loan> getLoansByStatus(String status) {
        return loanRepository.findByStatus(status);
    }

    public Loan updateLoan(
            Long id,
            Loan updatedLoan
    ) {

        Loan existingLoan =
                loanRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found with id: " + id
                                )
                        );

        existingLoan.setMember(
                updatedLoan.getMember()
        );

        existingLoan.setCycle(
                updatedLoan.getCycle()
        );

        existingLoan.setPrincipalAmount(
                updatedLoan.getPrincipalAmount()
        );

        existingLoan.setInterestRate(
                updatedLoan.getInterestRate()
        );

        existingLoan.setInterestAmount(
                updatedLoan.getInterestAmount()
        );

        existingLoan.setTotalAmount(
                updatedLoan.getTotalAmount()
        );

        existingLoan.setLoanDate(
                updatedLoan.getLoanDate()
        );

        existingLoan.setDueDate(
                updatedLoan.getDueDate()
        );

        existingLoan.setStatus(
                updatedLoan.getStatus()
        );

        return loanRepository.save(existingLoan);
    }

    public void deleteLoan(Long id) {

        if (!loanRepository.existsById(id)) {

            throw new RuntimeException(
                    "Loan not found with id: " + id
            );
        }

        loanRepository.deleteById(id);
    }

    /*
     * Validate loan data before processing.
     */
    private void validateLoan(Loan loan) {

        if (loan == null) {
            throw new RuntimeException(
                    "Loan data cannot be null"
            );
        }

        if (loan.getMember() == null ||
                loan.getMember().getId() == null) {

            throw new RuntimeException(
                    "Member is required"
            );
        }

        if (loan.getCycle() == null ||
                loan.getCycle().getId() == null) {

            throw new RuntimeException(
                    "Financial cycle is required"
            );
        }

        if (loan.getPrincipalAmount() == null ||
                loan.getPrincipalAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Principal amount must be greater than zero"
            );
        }

        if (loan.getInterestRate() == null ||
                loan.getInterestRate()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Interest rate cannot be negative"
            );
        }
    }
}