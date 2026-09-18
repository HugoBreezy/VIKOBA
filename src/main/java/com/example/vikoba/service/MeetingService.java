package com.example.vikoba.service;

import com.example.vikoba.entity.FinancialCycle;
import com.example.vikoba.entity.Meeting;
import com.example.vikoba.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(
            MeetingRepository meetingRepository
    ) {
        this.meetingRepository = meetingRepository;
    }

    /*
     * Create a new meeting.
     */
    public Meeting saveMeeting(Meeting meeting) {

        validateMeeting(meeting);

        Long cycleId =
                meeting.getCycle().getId();

        Integer meetingNumber =
                meeting.getMeetingNumber();

        /*
         * A meeting number can only appear once
         * within the same financial cycle.
         */
        if (meetingRepository
                .existsByCycleIdAndMeetingNumber(
                        cycleId,
                        meetingNumber
                )) {

            throw new RuntimeException(
                    "Meeting number "
                            + meetingNumber
                            + " already exists in this financial cycle"
            );
        }

        return meetingRepository.save(meeting);
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Optional<Meeting> getMeetingById(
            Long id
    ) {
        return meetingRepository.findById(id);
    }

    public List<Meeting> getMeetingsByCycle(
            Long cycleId
    ) {

        if (cycleId == null) {

            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        return meetingRepository.findByCycleId(
                cycleId
        );
    }

    public Optional<Meeting> getMeetingByCycleAndNumber(
            Long cycleId,
            Integer meetingNumber
    ) {

        if (cycleId == null) {

            throw new RuntimeException(
                    "Financial cycle ID is required"
            );
        }

        if (meetingNumber == null ||
                meetingNumber < 1) {

            throw new RuntimeException(
                    "Meeting number must be greater than zero"
            );
        }

        return meetingRepository
                .findByCycleIdAndMeetingNumber(
                        cycleId,
                        meetingNumber
                );
    }

    public boolean meetingExists(
            Long cycleId,
            Integer meetingNumber
    ) {

        if (cycleId == null ||
                meetingNumber == null) {

            return false;
        }

        return meetingRepository
                .existsByCycleIdAndMeetingNumber(
                        cycleId,
                        meetingNumber
                );
    }

    /*
     * Update an existing meeting.
     */
    public Meeting updateMeeting(
            Long id,
            Meeting updatedMeeting
    ) {

        Meeting existingMeeting =
                meetingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Meeting not found with id: "
                                                + id
                                )
                        );

        validateMeeting(updatedMeeting);

        Long newCycleId =
                updatedMeeting.getCycle().getId();

        Integer newMeetingNumber =
                updatedMeeting.getMeetingNumber();

        /*
         * Check if the new meeting number is already
         * used by another meeting in the same cycle.
         */
        Optional<Meeting> duplicateMeeting =
                meetingRepository
                        .findByCycleIdAndMeetingNumber(
                                newCycleId,
                                newMeetingNumber
                        );

        if (duplicateMeeting.isPresent() &&
                !duplicateMeeting.get()
                        .getId()
                        .equals(id)) {

            throw new RuntimeException(
                    "Meeting number "
                            + newMeetingNumber
                            + " already exists in this financial cycle"
            );
        }

        existingMeeting.setCycle(
                updatedMeeting.getCycle()
        );

        existingMeeting.setMeetingDate(
                updatedMeeting.getMeetingDate()
        );

        existingMeeting.setMeetingNumber(
                updatedMeeting.getMeetingNumber()
        );

        existingMeeting.setNotes(
                updatedMeeting.getNotes()
        );

        return meetingRepository.save(
                existingMeeting
        );
    }

    /*
     * Delete a meeting.
     */
    public void deleteMeeting(Long id) {

        if (!meetingRepository.existsById(id)) {

            throw new RuntimeException(
                    "Meeting not found with id: " + id
            );
        }

        meetingRepository.deleteById(id);
    }

    /*
     * Validate meeting information.
     */
    private void validateMeeting(
            Meeting meeting
    ) {

        if (meeting == null) {

            throw new RuntimeException(
                    "Meeting data cannot be null"
            );
        }

        /*
         * Financial cycle is required.
         */
        if (meeting.getCycle() == null ||
                meeting.getCycle().getId() == null) {

            throw new RuntimeException(
                    "Financial cycle is required"
            );
        }

        /*
         * Meeting date is required.
         */
        if (meeting.getMeetingDate() == null) {

            throw new RuntimeException(
                    "Meeting date is required"
            );
        }

        /*
         * Meeting number must be positive.
         */
        if (meeting.getMeetingNumber() == null ||
                meeting.getMeetingNumber() < 1) {

            throw new RuntimeException(
                    "Meeting number must be greater than zero"
            );
        }

        /*
         * Meeting date must fall within
         * the financial cycle dates.
         */
        FinancialCycle cycle =
                meeting.getCycle();

        LocalDate startDate =
                cycle.getStartDate();

        LocalDate endDate =
                cycle.getEndDate();

        if (startDate != null &&
                meeting.getMeetingDate()
                        .isBefore(startDate)) {

            throw new RuntimeException(
                    "Meeting date cannot be before the financial cycle start date"
            );
        }

        if (endDate != null &&
                meeting.getMeetingDate()
                        .isAfter(endDate)) {

            throw new RuntimeException(
                    "Meeting date cannot be after the financial cycle end date"
            );
        }

        /*
         * Meeting date cannot be in the future.
         */
        if (meeting.getMeetingDate()
                .isAfter(LocalDate.now())) {

            throw new RuntimeException(
                    "Meeting date cannot be in the future"
            );
        }
    }
}