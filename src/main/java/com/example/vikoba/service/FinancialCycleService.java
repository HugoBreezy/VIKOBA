package com.example.vikoba.service;

import com.example.vikoba.entity.FinancialCycle;
import com.example.vikoba.repository.FinancialCycleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FinancialCycleService {

    private final FinancialCycleRepository financialCycleRepository;

    public FinancialCycleService(
            FinancialCycleRepository financialCycleRepository
    ) {
        this.financialCycleRepository = financialCycleRepository;
    }

    /*
     * Create a new financial cycle.
     */
    public FinancialCycle saveCycle(
            FinancialCycle cycle
    ) {

        validateCycle(cycle);

        /*
         * Check whether another cycle already has
         * the same name.
         */
        if (financialCycleRepository.existsByName(
                cycle.getName()
        )) {

            throw new IllegalArgumentException(
                    "Financial cycle with this name already exists: "
                            + cycle.getName()
            );
        }

        /*
         * If status is not provided,
         * make the new cycle OPEN.
         */
        if (cycle.getStatus() == null ||
                cycle.getStatus().isBlank()) {

            cycle.setStatus("OPEN");
        }

        /*
         * Only one financial cycle can be OPEN
         * at a time.
         */
        if ("OPEN".equalsIgnoreCase(
                cycle.getStatus()
        )) {

            Optional<FinancialCycle> openCycle =
                    financialCycleRepository
                            .findByStatus("OPEN");

            if (openCycle.isPresent()) {

                throw new IllegalArgumentException(
                        "Another financial cycle is already OPEN. "
                                + "Close the current cycle before opening a new one."
                );
            }
        }

        return financialCycleRepository.save(cycle);
    }

    public List<FinancialCycle> getAllCycles() {
        return financialCycleRepository.findAll();
    }

    public Optional<FinancialCycle> getCycleById(
            Long id
    ) {
        return financialCycleRepository.findById(id);
    }

    /*
     * Get the currently open financial cycle.
     */
    public Optional<FinancialCycle> getOpenCycle() {
        return financialCycleRepository.findByStatus("OPEN");
    }

    public boolean cycleNameExists(
            String name
    ) {

        if (name == null || name.isBlank()) {
            return false;
        }

        return financialCycleRepository.existsByName(
                name
        );
    }

    /*
     * Update an existing financial cycle.
     */
    public FinancialCycle updateCycle(
            Long id,
            FinancialCycle updatedCycle
    ) {

        FinancialCycle existingCycle =
                financialCycleRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Financial cycle not found with id: "
                                                + id
                                )
                        );

        validateCycle(updatedCycle);

        /*
         * Check duplicate name.
         *
         * The current cycle is allowed to keep
         * its own name.
         */
        if (!existingCycle.getName().equals(
                updatedCycle.getName()
        ) &&
                financialCycleRepository.existsByName(
                        updatedCycle.getName()
                )) {

            throw new IllegalArgumentException(
                    "Financial cycle with this name already exists: "
                            + updatedCycle.getName()
            );
        }

        /*
         * If status is OPEN, make sure there is
         * no different cycle already OPEN.
         */
        if ("OPEN".equalsIgnoreCase(
                updatedCycle.getStatus()
        )) {

            Optional<FinancialCycle> openCycle =
                    financialCycleRepository
                            .findByStatus("OPEN");

            if (openCycle.isPresent() &&
                    !openCycle.get()
                            .getId()
                            .equals(id)) {

                throw new IllegalArgumentException(
                        "Another financial cycle is already OPEN. "
                                + "Close it before opening this cycle."
                );
            }
        }

        /*
         * If no status is supplied during update,
         * keep the existing status.
         */
        if (updatedCycle.getStatus() == null ||
                updatedCycle.getStatus().isBlank()) {

            updatedCycle.setStatus(
                    existingCycle.getStatus()
            );
        }

        existingCycle.setName(
                updatedCycle.getName()
        );

        existingCycle.setStartDate(
                updatedCycle.getStartDate()
        );

        existingCycle.setEndDate(
                updatedCycle.getEndDate()
        );

        existingCycle.setStatus(
                updatedCycle.getStatus()
        );

        return financialCycleRepository.save(
                existingCycle
        );
    }

    /*
     * Delete a financial cycle.
     */
    public void deleteCycle(Long id) {

        if (!financialCycleRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Financial cycle not found with id: "
                            + id
            );
        }

        financialCycleRepository.deleteById(id);
    }

    /*
     * Validate financial cycle data.
     */
    private void validateCycle(
            FinancialCycle cycle
    ) {

        if (cycle == null) {

            throw new IllegalArgumentException(
                    "Financial cycle data cannot be null"
            );
        }

        /*
         * Cycle name is required.
         */
        if (cycle.getName() == null ||
                cycle.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Financial cycle name is required"
            );
        }

        /*
         * Start date is required.
         */
        if (cycle.getStartDate() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle start date is required"
            );
        }

        /*
         * End date is required.
         */
        if (cycle.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Financial cycle end date is required"
            );
        }

        /*
         * End date must be after start date.
         */
        if (!cycle.getEndDate().isAfter(
                cycle.getStartDate()
        )) {

            throw new IllegalArgumentException(
                    "Financial cycle end date must be after start date"
            );
        }

        /*
         * Validate status if supplied.
         */
        if (cycle.getStatus() != null &&
                !cycle.getStatus().isBlank()) {

            String status =
                    cycle.getStatus().toUpperCase();

            if (!status.equals("OPEN") &&
                    !status.equals("CLOSED") &&
                    !status.equals("PENDING")) {

                throw new IllegalArgumentException(
                        "Invalid financial cycle status. "
                                + "Allowed values: OPEN, CLOSED, PENDING"
                );
            }

            /*
             * Store status consistently in uppercase.
             */
            cycle.setStatus(status);
        }
    }
}