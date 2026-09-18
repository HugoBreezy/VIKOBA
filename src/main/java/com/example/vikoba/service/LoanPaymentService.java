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

    public List<LoanPayment> getAllPayments() {
        return loanPaymentRepository.findAll();
    }

    public Optional<LoanPayment> getPaymentById(Long id) {
        return loanPaymentRepository.findById(id);
    }

    public List<LoanPayment> getPaymentsByInstallment(
            Long installmentId
    ) {

        return loanPaymentRepository.findByInstallmentId(
                installmentId
        );
    }

    public List<LoanPayment> getPaymentsByUser(Long userId) {

        return loanPaymentRepository.findByRecordedById(
                userId
        );
    }

    public List<LoanPayment> getPaymentsBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {

            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }

        return loanPaymentRepository.findByPaymentDateBetween(
                startDate,
                endDate
        );
    }

    /*
     * Update an existing payment.
     */
    public LoanPayment updatePayment(
            Long id,
            LoanPayment updatedPayment
    ) {

        LoanPayment existingPayment =
                loanPaymentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found with id: "
                                                + id
                                )
                        );

        validatePayment(updatedPayment);

        LoanInstallment installment =
                loanInstallmentRepository
                        .findById(
                                updatedPayment
                                        .getInstallment()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Installment not found with id: "
                                                + updatedPayment
                                                .getInstallment()
                                                .getId()
                                )
                        );

        existingPayment.setInstallment(
                installment
        );

        existingPayment.setAmount(
                updatedPayment.getAmount()
        );

        existingPayment.setPaymentDate(
                updatedPayment.getPaymentDate()
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

        return loanPaymentRepository.save(
                existingPayment
        );
    }

    /*
     * Delete a payment.
     */
    public void deletePayment(Long id) {

        if (!loanPaymentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Payment not found with id: " + id
            );
        }

        loanPaymentRepository.deleteById(id);
    }

    /*
     * Validate payment information.
     */
    private void validatePayment(
            LoanPayment payment
    ) {

        if (payment == null) {

            throw new RuntimeException(
                    "Payment data cannot be null"
            );
        }

        /*
         * Every payment must belong to an installment.
         */
        if (payment.getInstallment() == null ||
                payment.getInstallment().getId() == null) {

            throw new RuntimeException(
                    "Installment is required"
            );
        }

        /*
         * Payment amount must be greater than zero.
         */
        if (payment.getAmount() == null ||
                payment.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        /*
         * Payment date cannot be in the future.
         */
        if (payment.getPaymentDate() != null &&
                payment.getPaymentDate()
                        .isAfter(LocalDate.now())) {

            throw new RuntimeException(
                    "Payment date cannot be in the future"
            );
        }
    }
}