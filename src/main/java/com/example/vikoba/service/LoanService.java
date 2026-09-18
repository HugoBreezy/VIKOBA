package com.example.vikoba.service;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ============================================================
    // CREATE LOAN
    // ============================================================

    @Transactional
    public Loan saveLoan(Loan loan) {

        validateLoan(loan);

        Long memberId = loan.getMember().getId();
        Long cycleId = loan.getCycle().getId();

        // --------------------------------------------------------
        // CHECK OVERDUE UNPAID INSTALLMENTS
        // --------------------------------------------------------

        if (hasOverdueUnpaidInstallment(memberId)) {
            throw new IllegalArgumentException(
                    "Member cannot take a new loan because they have an overdue unpaid installment."
            );
        }

        // --------------------------------------------------------
        // GET TOTAL CONTRIBUTIONS
        // --------------------------------------------------------

        BigDecimal totalContributions =
                contributionRepository.findTotalAmountByMemberIdAndCycleId(
                        memberId,
                        cycleId
                );

        if (totalContributions == null) {
            totalContributions = BigDecimal.ZERO;
        }

        // --------------------------------------------------------
        // GET LOAN MULTIPLIER
        // --------------------------------------------------------

        BigDecimal loanMultiplier =
                getRequiredSetting("LOAN_MULTIPLIER");

        // Maximum loan = Contributions × Multiplier
        BigDecimal maximumLoan =
                totalContributions.multiply(loanMultiplier);

        if (loan.getPrincipalAmount().compareTo(maximumLoan) > 0) {
            throw new IllegalArgumentException(
                    "Loan amount exceeds the maximum allowed amount. " +
                            "Maximum allowed loan: " + maximumLoan
            );
        }

        // --------------------------------------------------------
        // GET LOAN DURATION SETTINGS
        // --------------------------------------------------------

        int maxLoanWeeks =
                getRequiredSetting("MAX_LOAN_WEEKS").intValue();

        int maxLoanInstallments =
                getRequiredSetting("MAX_LOAN_INSTALLMENTS").intValue();

        if (maxLoanWeeks <= 0) {
            throw new IllegalArgumentException(
                    "MAX_LOAN_WEEKS must be greater than zero."
            );
        }

        if (maxLoanInstallments <= 0) {
            throw new IllegalArgumentException(
                    "MAX_LOAN_INSTALLMENTS must be greater than zero."
            );
        }

        // --------------------------------------------------------
        // CALCULATE INTEREST
        // --------------------------------------------------------

        BigDecimal interestAmount =
                loan.getPrincipalAmount()
                        .multiply(loan.getInterestRate())
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        // --------------------------------------------------------
        // CALCULATE TOTAL LOAN
        // --------------------------------------------------------

        BigDecimal totalAmount =
                loan.getPrincipalAmount()
                        .add(interestAmount);

        // --------------------------------------------------------
        // LOAN DATE
        // --------------------------------------------------------

        if (loan.getLoanDate() == null) {
            loan.setLoanDate(LocalDate.now());
        }

        // --------------------------------------------------------
        // DUE DATE
        // --------------------------------------------------------

        loan.setDueDate(
                loan.getLoanDate().plusWeeks(maxLoanWeeks)
        );

        loan.setInterestAmount(interestAmount);
        loan.setTotalAmount(totalAmount);
        loan.setStatus("ACTIVE");

        // --------------------------------------------------------
        // SAVE LOAN
        // --------------------------------------------------------

        Loan savedLoan = loanRepository.save(loan);

        // --------------------------------------------------------
        // CREATE INSTALLMENTS
        // --------------------------------------------------------

        createInstallments(
                savedLoan,
                maxLoanInstallments
        );

        return savedLoan;
    }

    // ============================================================
    // CREATE INSTALLMENTS
    // ============================================================

    private void createInstallments(
            Loan loan,
            int numberOfInstallments
    ) {

        BigDecimal totalAmount = loan.getTotalAmount();

        BigDecimal installmentAmount =
                totalAmount.divide(
                        BigDecimal.valueOf(numberOfInstallments),
                        2,
                        RoundingMode.DOWN
                );

        BigDecimal totalCreated = BigDecimal.ZERO;

        for (int i = 1; i <= numberOfInstallments; i++) {

            LoanInstallment installment =
                    new LoanInstallment();

            installment.setLoan(loan);
            installment.setInstallmentNumber(i);

            BigDecimal amount;

            // Last installment gets the remaining balance
            if (i == numberOfInstallments) {

                amount = totalAmount.subtract(totalCreated);

            } else {

                amount = installmentAmount;
            }

            installment.setAmount(
                    amount.setScale(2, RoundingMode.HALF_UP)
            );

            installment.setDueDate(
                    loan.getLoanDate().plusWeeks(i)
            );

            installment.setStatus("PENDING");

            loanInstallmentRepository.save(installment);

            totalCreated = totalCreated.add(amount);
        }
    }

    // ============================================================
    // CHECK OVERDUE UNPAID INSTALLMENT
    // ============================================================

    private boolean hasOverdueUnpaidInstallment(Long memberId) {

        List<Loan> memberLoans =
                loanRepository.findByMemberId(memberId);

        LocalDate today = LocalDate.now();

        for (Loan loan : memberLoans) {

            List<LoanInstallment> installments =
                    loanInstallmentRepository.findByLoanId(
                            loan.getId()
                    );

            for (LoanInstallment installment : installments) {

                boolean isPaid =
                        "PAID".equalsIgnoreCase(
                                installment.getStatus()
                        );

                boolean hasDueDate =
                        installment.getDueDate() != null;

                boolean isOverdue =
                        hasDueDate
                                && installment.getDueDate().isBefore(today);

                if (!isPaid && isOverdue) {
                    return true;
                }
            }
        }

        return false;
    }

    // ============================================================
    // GET ALL LOANS
    // ============================================================

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    // ============================================================
    // GET LOAN BY ID
    // ============================================================

    public Optional<Loan> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    // ============================================================
    // GET LOANS BY MEMBER
    // ============================================================

    public List<Loan> getLoansByMember(Long memberId) {
        return loanRepository.findByMemberId(memberId);
    }

    // ============================================================
    // GET LOANS BY CYCLE
    // ============================================================

    public List<Loan> getLoansByCycle(Long cycleId) {
        return loanRepository.findByCycleId(cycleId);
    }

    // ============================================================
    // GET LOANS BY MEMBER AND CYCLE
    // ============================================================

    public List<Loan> getMemberLoansByCycle(
            Long memberId,
            Long cycleId
    ) {

        return loanRepository.findByMemberIdAndCycleId(
                memberId,
                cycleId
        );
    }

    // ============================================================
    // GET LOANS BY STATUS
    // ============================================================

    public List<Loan> getLoansByStatus(String status) {
        return loanRepository.findByStatus(status);
    }

    // ============================================================
    // UPDATE LOAN
    // ============================================================

    @Transactional
    public Loan updateLoan(Long id, Loan request) {

        Loan existingLoan = loanRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Loan not found with id: " + id
                        )
                );

        validateLoan(request);

        // --------------------------------------------------------
        // UPDATE MEMBER AND CYCLE
        // --------------------------------------------------------

        existingLoan.setMember(request.getMember());
        existingLoan.setCycle(request.getCycle());

        // --------------------------------------------------------
        // UPDATE PRINCIPAL AND INTEREST RATE
        // --------------------------------------------------------

        existingLoan.setPrincipalAmount(
                request.getPrincipalAmount()
        );

        existingLoan.setInterestRate(
                request.getInterestRate()
        );

        // --------------------------------------------------------
        // RECALCULATE INTEREST
        // --------------------------------------------------------

        BigDecimal interestAmount =
                request.getPrincipalAmount()
                        .multiply(request.getInterestRate())
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        // --------------------------------------------------------
        // RECALCULATE TOTAL AMOUNT
        // --------------------------------------------------------

        BigDecimal totalAmount =
                request.getPrincipalAmount()
                        .add(interestAmount);

        existingLoan.setInterestAmount(interestAmount);
        existingLoan.setTotalAmount(totalAmount);

        // --------------------------------------------------------
        // UPDATE LOAN DATE
        // --------------------------------------------------------

        if (request.getLoanDate() != null) {

            existingLoan.setLoanDate(
                    request.getLoanDate()
            );

        } else if (existingLoan.getLoanDate() == null) {

            existingLoan.setLoanDate(
                    LocalDate.now()
            );
        }

        // --------------------------------------------------------
        // RECALCULATE DUE DATE
        // --------------------------------------------------------

        int maxLoanWeeks =
                getRequiredSetting("MAX_LOAN_WEEKS").intValue();

        if (maxLoanWeeks <= 0) {
            throw new IllegalArgumentException(
                    "MAX_LOAN_WEEKS must be greater than zero."
            );
        }

        existingLoan.setDueDate(
                existingLoan.getLoanDate()
                        .plusWeeks(maxLoanWeeks)
        );

        // --------------------------------------------------------
        // UPDATE STATUS
        // --------------------------------------------------------

        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            existingLoan.setStatus(
                    request.getStatus()
            );
        }

        return loanRepository.save(existingLoan);
    }

    // ============================================================
    // DELETE LOAN
    // ============================================================

    @Transactional
    public void deleteLoan(Long id) {

        if (!loanRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Loan not found with id: " + id
            );
        }

        loanRepository.deleteById(id);
    }

    // ============================================================
    // VALIDATE LOAN
    // ============================================================

    private void validateLoan(Loan loan) {

        if (loan == null) {
            throw new IllegalArgumentException(
                    "Loan data cannot be null."
            );
        }

        if (loan.getMember() == null
                || loan.getMember().getId() == null) {

            throw new IllegalArgumentException(
                    "Member is required."
            );
        }

        if (loan.getCycle() == null
                || loan.getCycle().getId() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle is required."
            );
        }

        if (loan.getPrincipalAmount() == null
                || loan.getPrincipalAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Principal amount must be greater than zero."
            );
        }

        if (loan.getInterestRate() == null
                || loan.getInterestRate()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Interest rate cannot be negative."
            );
        }
    }

    // ============================================================
    // GET REQUIRED SYSTEM SETTING
    // ============================================================

    private BigDecimal getRequiredSetting(String key) {

        String value =
                systemSettingService
                        .getSettingValue(key);

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "Required system setting not found: " + key
            );
        }

        try {

            return new BigDecimal(value);

        } catch (NumberFormatException e) {

            throw new IllegalArgumentException(
                    "Invalid numeric value for system setting: "
                            + key
            );
        }
    }
}