package com.example.vikoba.controller;

import com.example.vikoba.entity.Meeting;
import com.example.vikoba.service.MeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Meeting> createMeeting(
            @RequestBody Meeting meeting
    ) {

        return ResponseEntity.ok(
                meetingService.saveMeeting(meeting)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Meeting>> getAllMeetings() {

        return ResponseEntity.ok(
                meetingService.getAllMeetings()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Meeting> getMeetingById(
            @PathVariable Long id
    ) {

        return meetingService.getMeetingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Meeting>> getMeetingsByCycle(
            @PathVariable Long cycleId
    ) {

        return ResponseEntity.ok(
                meetingService.getMeetingsByCycle(cycleId)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}/number/{meetingNumber}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Meeting> getMeetingByCycleAndNumber(
            @PathVariable Long cycleId,
            @PathVariable Integer meetingNumber
    ) {

        return meetingService
                .getMeetingByCycleAndNumber(
                        cycleId,
                        meetingNumber
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Meeting> updateMeeting(
            @PathVariable Long id,
            @RequestBody Meeting meeting
    ) {

        return ResponseEntity.ok(
                meetingService.updateMeeting(
                        id,
                        meeting
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMeeting(
            @PathVariable Long id
    ) {

        meetingService.deleteMeeting(id);

        return ResponseEntity.noContent().build();
    }
}