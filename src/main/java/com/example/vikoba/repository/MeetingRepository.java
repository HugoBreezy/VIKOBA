package com.example.vikoba.repository;

import com.example.vikoba.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByCycleId(Long cycleId);

    Optional<Meeting> findByCycleIdAndMeetingNumber(
            Long cycleId,
            Integer meetingNumber
    );

    boolean existsByCycleIdAndMeetingNumber(
            Long cycleId,
            Integer meetingNumber
    );
}