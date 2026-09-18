package com.example.vikoba.service;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.entity.Penalty;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.PenaltyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final SystemSettingService systemSettingService;

    public PenaltyService(
            PenaltyRepository penaltyRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            SystemSettingService systemSettingService
    ) {
        this.penaltyRepository = penaltyRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.systemSettingService = systemSettingService;
    }

    // ============================================================
    // CREATE PENALTY
    // ============================================================

    /*
     * Create a penalty for an overdue installment.
     *
     * Business rule:
     *
     * Penalty = penalty rate × interest attributable
     * to the overdue installment.
     *
     * The installment is loaded from the database
     * using its ID.
     */
    @Transactional
    public Penalty savePenalty(Penalty penalty) {

        validatePenalty(penalty);

        Long installmentId =
                penalty.getInstallment().getId();

        /*
         * Load the complete installment from database.
         */
        LoanInstallment installment =
                loanInstallmentRepository.findById(
                        installmentId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Installment not found with id: "
                                        + installmentId
                        )
                );

        /*
         * Check whether this installment already
         * has a pending penalty.
         */
        Optional<Penalty> existingPenalty =
                penaltyRepository
                        .findByInstallmentIdAndStatus(
                                installmentId,
                                "PENDING"
                        );

        if (existingPenalty.isPresent()) {

            throw new IllegalArgumentException(
                    "Penalty has already been created for this installment"
            );
        }

        /*
         * The installment must actually be overdue.
         */
        if (!isOverdue(installment)) {

            throw new IllegalArgumentException(
                    "This installment is not overdue"
            );
        }

        /*
         * Get the loan associated with the installment.
         */
        Loan loan = installment.getLoan();

        if (loan == null) {

            throw new IllegalArgumentException(
                    "Installment is not associated with a loan"
            );
        }

        /*
         * Get penalty rate from system settings.
         *
         * Example:
         * PENALTY_RATE = 25
         */
        BigDecimal penaltyRate =
                systemSettingService.getDecimalSetting(
                        "PENALTY_RATE"
                );

        if (penaltyRate == null ||
                penaltyRate.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "PENALTY_RATE must be greater than zero"
            );
        }

        /*
         * Calculate the interest attributable
         * to this installment.
         */
        BigDecimal installmentInterest =
                calculateInstallmentInterest(
                        loan,
                        installment
                );

        /*
         * Penalty =
         * installment interest × penalty rate / 100
         */
        BigDecimal penaltyAmount =
                installmentInterest
                        .multiply(penaltyRate)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        if (penaltyAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Calculated penalty amount must be greater than zero"
            );
        }

        /*
         * Always use the installment loaded
         * from the database.
         */
        penalty.setInstallment(installment);

        /*
         * Rate and amount are calculated by the system.
         */
        penalty.setPenaltyRate(penaltyRate);
        penalty.setPenaltyAmount(penaltyAmount);

        if (penalty.getPenaltyDate() == null) {

            penalty.setPenaltyDate(
                    LocalDate.now()
            );
        }

        if (penalty.getStatus() == null ||
                penalty.getStatus().isBlank()) {

            penalty.setStatus("PENDING");
        }

        return penaltyRepository.save(penalty);
    }

    // ============================================================
    // CALCULATE INSTALLMENT INTEREST
    // ============================================================

    /*
     * Calculate the interest attributable
     * to one installment.
     *
     * Formula:
     *
     * Loan Interest ×
     * (Installment Amount ÷ Loan Total Amount)
     */
    private BigDecimal calculateInstallmentInterest(
            Loan loan,
            LoanInstallment installment
    ) {

        if (loan.getTotalAmount() == null ||
                loan.getInterestAmount() == null) {

            throw new IllegalArgumentException(
                    "Loan total amount and interest amount are required"
            );
        }

        if (installment.getAmount() == null) {

            throw new IllegalArgumentException(
                    "Installment amount is required"
            );
        }

        if (loan.getTotalAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Loan total amount must be greater than zero"
            );
        }

        return loan.getInterestAmount()
                .multiply(installment.getAmount())
                .divide(
                        loan.getTotalAmount(),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // ============================================================
    // CHECK OVERDUE
    // ============================================================

    /*
     * Check whether an installment is overdue.
     *
     * An installment is overdue when:
     * - due date has passed
     * - it is not fully PAID
     */
    public boolean isOverdue(
            LoanInstallment installment
    ) {

        if (installment == null) {
            return false;
        }

        if (installment.getDueDate() == null) {
            return false;
        }

        if ("PAID".equalsIgnoreCase(
                installment.getStatus()
        )) {
            return false;
        }

        return installment.getDueDate()
                .isBefore(LocalDate.now());
    }

    // ============================================================
    // GET ALL PENALTIES
    // ============================================================

    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    // ============================================================
    // GET PENALTY BY ID
    // ============================================================

    public Optional<Penalty> getPenaltyById(Long id) {
        return penaltyRepository.findById(id);
    }

    // ============================================================
    // GET PENALTIES BY INSTALLMENT
    // ============================================================

    public List<Penalty> getPenaltiesByInstallment(
            Long installmentId
    ) {
        return penaltyRepository.findByInstallmentId(
                installmentId
        );
    }

    // ============================================================
    // GET PENALTY BY INSTALLMENT AND STATUS
    // ============================================================

    public Optional<Penalty> getPenaltyByInstallmentAndStatus(
            Long installmentId,
            String status
    ) {
        return penaltyRepository.findByInstallmentIdAndStatus(
                installmentId,
                status
        );
    }

    // ============================================================
    // GET PENALTIES BY STATUS
    // ============================================================

    public List<Penalty> getPenaltiesByStatus(
            String status
    ) {
        return penaltyRepository.findByStatus(status);
    }

    // ============================================================
    // UPDATE PENALTY
    // ============================================================

    @Transactional
    public Penalty updatePenalty(
            Long id,
            Penalty updatedPenalty
    ) {

        Penalty existingPenalty =
                penaltyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Penalty not found with id: "
                                                + id
                                )
                        );

        validatePenalty(updatedPenalty);

        /*
         * Load the complete installment from database.
         */
        Long installmentId =
                updatedPenalty
                        .getInstallment()
                        .getId();

        LoanInstallment installment =
                loanInstallmentRepository.findById(
                        installmentId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Installment not found with id: "
                                        + installmentId
                        )
                );

        /*
         * Penalty can only exist for an overdue
         * unpaid installment.
         */
        if (!isOverdue(installment)) {

            throw new IllegalArgumentException(
                    "This installment is not overdue"
            );
        }

        /*
         * Get loan associated with installment.
         */
        Loan loan = installment.getLoan();

        if (loan == null) {

            throw new IllegalArgumentException(
                    "Installment is not associated with a loan"
            );
        }

        /*
         * Get current penalty rate from system settings.
         *
         * Do NOT trust penalty rate sent by Postman.
         */
        BigDecimal penaltyRate =
                systemSettingService.getDecimalSetting(
                        "PENALTY_RATE"
                );

        if (penaltyRate == null ||
                penaltyRate.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "PENALTY_RATE must be greater than zero"
            );
        }

        /*
         * Recalculate the interest attributable
         * to this installment.
         */
        BigDecimal installmentInterest =
                calculateInstallmentInterest(
                        loan,
                        installment
                );

        /*
         * Recalculate penalty amount.
         */
        BigDecimal penaltyAmount =
                installmentInterest
                        .multiply(penaltyRate)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        if (penaltyAmount.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new IllegalArgumentException(
                    "Calculated penalty amount must be greater than zero"
            );
        }

        /*
         * Use the database installment.
         */
        existingPenalty.setInstallment(
                installment
        );

        /*
         * Rate and amount are controlled
         * by the system.
         */
        existingPenalty.setPenaltyRate(
                penaltyRate
        );

        existingPenalty.setPenaltyAmount(
                penaltyAmount
        );

        /*
         * Update date only if supplied.
         */
        if (updatedPenalty.getPenaltyDate() != null) {

            existingPenalty.setPenaltyDate(
                    updatedPenalty.getPenaltyDate()
            );

        } else if (existingPenalty.getPenaltyDate() == null) {

            existingPenalty.setPenaltyDate(
                    LocalDate.now()
            );
        }

        /*
         * Status can be updated.
         */
        if (updatedPenalty.getStatus() != null &&
                !updatedPenalty.getStatus().isBlank()) {

            existingPenalty.setStatus(
                    updatedPenalty.getStatus()
            );
        }

        /*
         * Notes can be updated.
         */
        existingPenalty.setNotes(
                updatedPenalty.getNotes()
        );

        return penaltyRepository.save(
                existingPenalty
        );
    }

    // ============================================================
    // DELETE PENALTY
    // ============================================================

    @Transactional
    public void deletePenalty(Long id) {

        if (!penaltyRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Penalty not found with id: " + id
            );
        }

        penaltyRepository.deleteById(id);
    }

    // ============================================================
    // VALIDATE PENALTY
    // ============================================================

    private void validatePenalty(
            Penalty penalty
    ) {

        if (penalty == null) {

            throw new IllegalArgumentException(
                    "Penalty data cannot be null"
            );
        }

        if (penalty.getInstallment() == null ||
                penalty.getInstallment().getId() == null) {

            throw new IllegalArgumentException(
                    "Installment is required"
            );
        }

        /*
         * These fields may be omitted from the request
         * because the system calculates them.
         *
         * If supplied, negative values are still rejected.
         */
        if (penalty.getPenaltyRate() != null &&
                penalty.getPenaltyRate()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Penalty rate cannot be negative"
            );
        }

        if (penalty.getPenaltyAmount() != null &&
                penalty.getPenaltyAmount()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Penalty amount cannot be negative"
            );
        }
    }
}