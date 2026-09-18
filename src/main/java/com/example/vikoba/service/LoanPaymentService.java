package com.example.vikoba.service;

import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.entity.LoanPayment;
import com.example.vikoba.entity.Penalty;
import com.example.vikoba.repository.LoanPaymentRepository;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.PenaltyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LoanPaymentService {

    private final LoanPaymentRepository loanPaymentRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final PenaltyRepository penaltyRepository;

    public LoanPaymentService(
            LoanPaymentRepository loanPaymentRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            PenaltyRepository penaltyRepository
    ) {
        this.loanPaymentRepository = loanPaymentRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.penaltyRepository = penaltyRepository;
    }

    // ============================================================
    // CREATE PAYMENT
    // ============================================================

    /*
     * Record a payment for an installment.
     *
     * Payment can cover:
     *
     * 1. Installment only
     * 2. Installment + penalty
     *
     * Example:
     *
     * Installment = 4,583.33
     * Penalty     =   104.17
     * Total       = 4,687.50
     */
    @Transactional
    public LoanPayment savePayment(LoanPayment payment) {

        validatePayment(payment);

        Long installmentId =
                payment.getInstallment().getId();

        /*
         * Load complete installment from database.
         */
        LoanInstallment installment =
                loanInstallmentRepository.findById(installmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Installment not found with id: "
                                                + installmentId
                                )
                        );

        /*
         * Do not allow payment on an already fully
         * paid installment.
         */
        if ("PAID".equalsIgnoreCase(
                installment.getStatus()
        )) {

            throw new RuntimeException(
                    "This installment has already been fully paid"
            );
        }

        /*
         * Get all previous payments for this installment.
         */
        List<LoanPayment> previousPayments =
                loanPaymentRepository.findByInstallmentId(
                        installmentId
                );

        BigDecimal alreadyPaid = BigDecimal.ZERO;

        for (LoanPayment previousPayment : previousPayments) {

            if (previousPayment.getAmount() != null) {

                alreadyPaid =
                        alreadyPaid.add(
                                previousPayment.getAmount()
                        );
            }
        }

        /*
         * Remaining installment amount.
         */
        BigDecimal remainingInstallment =
                installment.getAmount()
                        .subtract(alreadyPaid)
                        .setScale(2);

        if (remainingInstallment.compareTo(
                BigDecimal.ZERO
        ) <= 0) {

            throw new RuntimeException(
                    "There is no remaining amount for this installment"
            );
        }

        /*
         * Find a pending penalty for this installment.
         */
        Optional<Penalty> pendingPenalty =
                penaltyRepository
                        .findByInstallmentIdAndStatus(
                                installmentId,
                                "PENDING"
                        );

        BigDecimal penaltyAmount = BigDecimal.ZERO;

        if (pendingPenalty.isPresent() &&
                pendingPenalty.get().getPenaltyAmount() != null) {

            penaltyAmount =
                    pendingPenalty.get()
                            .getPenaltyAmount()
                            .setScale(2);
        }

        /*
         * Total amount required to clear:
         *
         * remaining installment + pending penalty
         */
        BigDecimal totalDue =
                remainingInstallment
                        .add(penaltyAmount)
                        .setScale(2);

        /*
         * Do not allow payment above the installment
         * plus penalty.
         */
        if (payment.getAmount()
                .compareTo(totalDue) > 0) {

            throw new RuntimeException(
                    "Payment exceeds the total amount due. "
                            + "Total due: "
                            + totalDue
            );
        }

        /*
         * Set payment date automatically if not supplied.
         */
        if (payment.getPaymentDate() == null) {

            payment.setPaymentDate(
                    LocalDate.now()
            );
        }

        /*
         * Replace incomplete installment object
         * with the complete entity from DB.
         */
        payment.setInstallment(installment);

        /*
         * Save the payment.
         */
        LoanPayment savedPayment =
                loanPaymentRepository.save(payment);

        /*
         * Amount received from this payment.
         */
        BigDecimal paymentAmount =
                payment.getAmount()
                        .setScale(2);

        /*
         * First allocate payment to the
         * remaining installment.
         */
        BigDecimal amountForInstallment =
                paymentAmount.min(
                        remainingInstallment
                );

        BigDecimal remainingAfterInstallment =
                paymentAmount
                        .subtract(amountForInstallment)
                        .setScale(2);

        /*
         * Calculate total installment paid
         * after this payment.
         */
        BigDecimal totalInstallmentPaid =
                alreadyPaid
                        .add(amountForInstallment)
                        .setScale(2);

        /*
         * Update installment status.
         */
        if (totalInstallmentPaid.compareTo(
                installment.getAmount()
        ) >= 0) {

            installment.setStatus("PAID");

        } else {

            installment.setStatus("PARTIAL");
        }

        loanInstallmentRepository.save(installment);

        /*
         * If there is a pending penalty and
         * payment has money remaining after
         * clearing the installment, use that
         * remaining amount to clear the penalty.
         */
        if (pendingPenalty.isPresent() &&
                remainingAfterInstallment
                        .compareTo(BigDecimal.ZERO) > 0) {

            Penalty penalty =
                    pendingPenalty.get();

            BigDecimal currentPenalty =
                    penalty.getPenaltyAmount()
                            .setScale(2);

            /*
             * At the moment we support clearing
             * the penalty completely.
             *
             * If payment is not enough to clear
             * the penalty, it remains PENDING.
             */
            if (remainingAfterInstallment.compareTo(
                    currentPenalty
            ) >= 0) {

                penalty.setStatus("PAID");

                penaltyRepository.save(penalty);
            }
        }

        return savedPayment;
    }

    // ============================================================
    // GET ALL PAYMENTS
    // ============================================================

    public List<LoanPayment> getAllPayments() {
        return loanPaymentRepository.findAll();
    }

    // ============================================================
    // GET PAYMENT BY ID
    // ============================================================

    public Optional<LoanPayment> getPaymentById(Long id) {
        return loanPaymentRepository.findById(id);
    }

    // ============================================================
    // GET PAYMENTS BY INSTALLMENT
    // ============================================================

    public List<LoanPayment> getPaymentsByInstallment(
            Long installmentId
    ) {

        return loanPaymentRepository.findByInstallmentId(
                installmentId
        );
    }

    // ============================================================
    // GET PAYMENTS BY USER
    // ============================================================

    public List<LoanPayment> getPaymentsByUser(Long userId) {

        return loanPaymentRepository.findByRecordedById(
                userId
        );
    }

    // ============================================================
    // GET PAYMENTS BETWEEN DATES
    // ============================================================

    public List<LoanPayment> getPaymentsBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        return loanPaymentRepository.findByPaymentDateBetween(
                startDate,
                endDate
        );
    }

    // ============================================================
    // UPDATE PAYMENT
    // ============================================================

    @Transactional
    public LoanPayment updatePayment(
            Long id,
            LoanPayment updatedPayment
    ) {

        LoanPayment existingPayment =
                loanPaymentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found with id: "
                                                + id
                                )
                        );

        validatePayment(updatedPayment);

        /*
         * Remember the old installment because the payment
         * may be moved to another installment.
         */
        LoanInstallment oldInstallment =
                existingPayment.getInstallment();

        /*
         * Load the new installment from database.
         */
        Long newInstallmentId =
                updatedPayment
                        .getInstallment()
                        .getId();

        LoanInstallment newInstallment =
                loanInstallmentRepository
                        .findById(newInstallmentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Installment not found with id: "
                                                + newInstallmentId
                                )
                        );

        /*
         * Payment date.
         */
        LocalDate paymentDate =
                updatedPayment.getPaymentDate();

        if (paymentDate == null) {
            paymentDate = LocalDate.now();
        }

        /*
         * Update payment fields.
         */
        existingPayment.setInstallment(
                newInstallment
        );

        existingPayment.setAmount(
                updatedPayment.getAmount()
        );

        existingPayment.setPaymentDate(
                paymentDate
        );

        existingPayment.setRecordedBy(
                updatedPayment.getRecordedBy()
        );

        existingPayment.setReferenceNumber(
                updatedPayment.getReferenceNumber()
        );

        existingPayment.setNotes(
                updatedPayment.getNotes()
        );

        /*
         * Save updated payment.
         */
        LoanPayment savedPayment =
                loanPaymentRepository.save(
                        existingPayment
                );

        /*
         * Recalculate the old installment.
         *
         * This is important if the payment was moved
         * from one installment to another.
         */
        if (oldInstallment != null) {

            recalculateInstallmentAndPenalty(
                    oldInstallment.getId()
            );
        }

        /*
         * Recalculate the new installment.
         */
        if (newInstallment.getId() != null) {

            recalculateInstallmentAndPenalty(
                    newInstallment.getId()
            );
        }

        return savedPayment;
    }

    // ============================================================
    // RECALCULATE INSTALLMENT AND PENALTY
    // ============================================================

    private void recalculateInstallmentAndPenalty(
            Long installmentId
    ) {

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
         * Get all payments for this installment.
         */
        List<LoanPayment> payments =
                loanPaymentRepository.findByInstallmentId(
                        installmentId
                );

        BigDecimal totalPaid = BigDecimal.ZERO;

        for (LoanPayment payment : payments) {

            if (payment.getAmount() != null) {

                totalPaid =
                        totalPaid.add(
                                payment.getAmount()
                        );
            }
        }

        totalPaid = totalPaid.setScale(2);

        /*
         * Update installment status.
         */
        if (totalPaid.compareTo(
                installment.getAmount()
        ) >= 0) {

            installment.setStatus("PAID");

        } else if (totalPaid.compareTo(
                BigDecimal.ZERO
        ) > 0) {

            installment.setStatus("PARTIAL");

        } else {

            installment.setStatus("PENDING");
        }

        loanInstallmentRepository.save(
                installment
        );

        /*
         * Find penalty for this installment.
         */
        Optional<Penalty> penaltyOptional =
                penaltyRepository
                        .findByInstallmentIdAndStatus(
                                installmentId,
                                "PENDING"
                        );

        /*
         * If there is no pending penalty,
         * there is nothing else to update.
         */
        if (penaltyOptional.isEmpty()) {
            return;
        }

        Penalty penalty =
                penaltyOptional.get();

        if (penalty.getPenaltyAmount() == null) {
            return;
        }

        /*
         * Penalty can only be considered paid
         * after the installment itself is fully paid.
         *
         * Any amount above the installment amount
         * is treated as money available for penalty.
         */
        if ("PAID".equalsIgnoreCase(
                installment.getStatus()
        )) {

            BigDecimal amountAvailableForPenalty =
                    totalPaid
                            .subtract(installment.getAmount())
                            .setScale(2);

            if (amountAvailableForPenalty.compareTo(
                    penalty.getPenaltyAmount()
            ) >= 0) {

                penalty.setStatus("PAID");

                penaltyRepository.save(
                        penalty
                );
            }
        }
    }

    // ============================================================
    // DELETE PAYMENT
    // ============================================================

    @Transactional
    public void deletePayment(Long id) {

        LoanPayment existingPayment =
                loanPaymentRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Payment not found with id: "
                                                + id
                                )
                        );

        Long installmentId =
                existingPayment.getInstallment() != null
                        ? existingPayment
                        .getInstallment()
                        .getId()
                        : null;

        loanPaymentRepository.deleteById(id);

        /*
         * After deleting a payment, recalculate the
         * installment status.
         */
        if (installmentId != null) {

            recalculateInstallmentAndPenalty(
                    installmentId
            );
        }
    }

    // ============================================================
    // VALIDATE PAYMENT
    // ============================================================

    private void validatePayment(
            LoanPayment payment
    ) {

        if (payment == null) {

            throw new IllegalArgumentException(
                    "Payment data cannot be null"
            );
        }

        /*
         * Every payment must belong to an installment.
         */
        if (payment.getInstallment() == null ||
                payment.getInstallment().getId() == null) {

            throw new IllegalArgumentException(
                    "Installment is required"
            );
        }

        /*
         * Payment amount must be greater than zero.
         */
        if (payment.getAmount() == null ||
                payment.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero"
            );
        }

        /*
         * Payment date cannot be in the future.
         */
        if (payment.getPaymentDate() != null &&
                payment.getPaymentDate()
                        .isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Payment date cannot be in the future"
            );
        }
    }
}