package com.example.vikoba.service;

import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.repository.LoanInstallmentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class LoanInstallmentService {

    private final LoanInstallmentRepository installmentRepository;

    public LoanInstallmentService(
            LoanInstallmentRepository installmentRepository
    ) {
        this.installmentRepository = installmentRepository;
    }

    public LoanInstallment saveInstallment(
            LoanInstallment installment
    ) {

        validateInstallment(installment);

        /*
         * If status is not provided,
         * use PENDING by default.
         */
        if (installment.getStatus() == null ||
                installment.getStatus().isBlank()) {

            installment.setStatus("PENDING");
        }

        return installmentRepository.save(installment);
    }

    public List<LoanInstallment> getAllInstallments() {
        return installmentRepository.findAll();
    }

    public Optional<LoanInstallment> getInstallmentById(
            Long id
    ) {
        return installmentRepository.findById(id);
    }

    public List<LoanInstallment> getInstallmentsByLoan(
            Long loanId
    ) {
        return installmentRepository.findByLoanId(loanId);
    }

    public Optional<LoanInstallment> getInstallmentByLoanAndNumber(
            Long loanId,
            Integer installmentNumber
    ) {
        return installmentRepository
                .findByLoanIdAndInstallmentNumber(
                        loanId,
                        installmentNumber
                );
    }

    public List<LoanInstallment> getInstallmentsByStatus(
            String status
    ) {
        return installmentRepository.findByStatus(status);
    }

    public LoanInstallment updateInstallment(
            Long id,
            LoanInstallment updatedInstallment
    ) {

        LoanInstallment existingInstallment =
                installmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Installment not found with id: "
                                                + id
                                )
                        );

        /*
         * Validate the new installment data
         * before updating.
         */
        validateInstallment(updatedInstallment);

        existingInstallment.setLoan(
                updatedInstallment.getLoan()
        );

        existingInstallment.setInstallmentNumber(
                updatedInstallment.getInstallmentNumber()
        );

        existingInstallment.setDueDate(
                updatedInstallment.getDueDate()
        );

        existingInstallment.setAmount(
                updatedInstallment.getAmount()
        );

        /*
         * If status is empty, keep the existing status.
         */
        if (updatedInstallment.getStatus() == null ||
                updatedInstallment.getStatus().isBlank()) {

            existingInstallment.setStatus(
                    existingInstallment.getStatus()
            );

        } else {

            existingInstallment.setStatus(
                    updatedInstallment.getStatus()
            );
        }

        return installmentRepository.save(existingInstallment);
    }

    public void deleteInstallment(Long id) {

        if (!installmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Installment not found with id: " + id
            );
        }

        installmentRepository.deleteById(id);
    }

    /*
     * Validate installment information.
     */
    private void validateInstallment(
            LoanInstallment installment
    ) {

        if (installment == null) {

            throw new RuntimeException(
                    "Installment data cannot be null"
            );
        }

        /*
         * Every installment must belong to a loan.
         */
        if (installment.getLoan() == null ||
                installment.getLoan().getId() == null) {

            throw new RuntimeException(
                    "Loan is required"
            );
        }

        /*
         * Installment number must be between 1 and 12.
         */
        if (installment.getInstallmentNumber() == null ||
                installment.getInstallmentNumber() < 1 ||
                installment.getInstallmentNumber() > 12) {

            throw new RuntimeException(
                    "Installment number must be between 1 and 12"
            );
        }

        /*
         * Due date is required.
         */
        if (installment.getDueDate() == null) {

            throw new RuntimeException(
                    "Installment due date is required"
            );
        }

        /*
         * Installment amount must be greater than zero.
         */
        if (installment.getAmount() == null ||
                installment.getAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Installment amount must be greater than zero"
            );
        }
    }
}