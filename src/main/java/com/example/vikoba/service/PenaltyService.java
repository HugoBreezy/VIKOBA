package com.example.vikoba.service;

import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.entity.Penalty;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.PenaltyRepository;
import org.springframework.stereotype.Service;

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
                        new RuntimeException(
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

            throw new RuntimeException(
                    "Penalty has already been created for this installment"
            );
        }

        /*
         * The installment must actually be overdue.
         */
        if (!isOverdue(installment)) {

            throw new RuntimeException(
                    "This installment is not overdue"
            );
        }

        /*
         * Get the loan associated with the installment.
         */
        Loan loan = installment.getLoan();

        if (loan == null) {

            throw new RuntimeException(
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

            throw new RuntimeException(
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

            throw new RuntimeException(
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

            throw new RuntimeException(
                    "Loan total amount and interest amount are required"
            );
        }

        if (installment.getAmount() == null) {

            throw new RuntimeException(
                    "Installment amount is required"
            );
        }

        if (loan.getTotalAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
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

    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    public Optional<Penalty> getPenaltyById(Long id) {
        return penaltyRepository.findById(id);
    }

    public List<Penalty> getPenaltiesByInstallment(
            Long installmentId
    ) {
        return penaltyRepository.findByInstallmentId(
                installmentId
        );
    }

    public Optional<Penalty> getPenaltyByInstallmentAndStatus(
            Long installmentId,
            String status
    ) {
        return penaltyRepository.findByInstallmentIdAndStatus(
                installmentId,
                status
        );
    }

    public List<Penalty> getPenaltiesByStatus(
            String status
    ) {
        return penaltyRepository.findByStatus(status);
    }

    /*
     * Update an existing penalty.
     */
    public Penalty updatePenalty(
            Long id,
            Penalty updatedPenalty
    ) {

        Penalty existingPenalty =
                penaltyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Penalty not found with id: "
                                                + id
                                )
                        );

        validatePenalty(updatedPenalty);

        /*
         * Load the complete installment from database.
         */
        Long installmentId =
                updatedPenalty.getInstallment().getId();

        LoanInstallment installment =
                loanInstallmentRepository.findById(
                        installmentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Installment not found with id: "
                                        + installmentId
                        )
                );

        if (!isOverdue(installment)) {

            throw new RuntimeException(
                    "This installment is not overdue"
            );
        }

        existingPenalty.setInstallment(
                installment
        );

        existingPenalty.setPenaltyRate(
                updatedPenalty.getPenaltyRate()
        );

        existingPenalty.setPenaltyAmount(
                updatedPenalty.getPenaltyAmount()
        );

        existingPenalty.setPenaltyDate(
                updatedPenalty.getPenaltyDate()
        );

        existingPenalty.setStatus(
                updatedPenalty.getStatus()
        );

        existingPenalty.setNotes(
                updatedPenalty.getNotes()
        );

        return penaltyRepository.save(existingPenalty);
    }

    /*
     * Delete penalty.
     */
    public void deletePenalty(Long id) {

        if (!penaltyRepository.existsById(id)) {

            throw new RuntimeException(
                    "Penalty not found with id: " + id
            );
        }

        penaltyRepository.deleteById(id);
    }

    /*
     * Validate penalty information.
     */
    private void validatePenalty(
            Penalty penalty
    ) {

        if (penalty == null) {

            throw new RuntimeException(
                    "Penalty data cannot be null"
            );
        }

        if (penalty.getInstallment() == null ||
                penalty.getInstallment().getId() == null) {

            throw new RuntimeException(
                    "Installment is required"
            );
        }

        if (penalty.getPenaltyRate() != null &&
                penalty.getPenaltyRate()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Penalty rate cannot be negative"
            );
        }

        if (penalty.getPenaltyAmount() != null &&
                penalty.getPenaltyAmount()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Penalty amount cannot be negative"
            );
        }
    }
}