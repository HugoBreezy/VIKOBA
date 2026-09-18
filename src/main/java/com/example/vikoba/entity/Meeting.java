package com.example.vikoba.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "meetings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_meeting_cycle_number",
                        columnNames = {"cycle_id", "meeting_number"}
                )
        }
)
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private FinancialCycle cycle;

    @Column(name = "meeting_date", nullable = false)
    private LocalDate meetingDate;

    @Column(name = "meeting_number", nullable = false)
    private Integer meetingNumber;

    @Column(length = 500)
    private String notes;

    public Meeting() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FinancialCycle getCycle() {
        return cycle;
    }

    public void setCycle(FinancialCycle cycle) {
        this.cycle = cycle;
    }

    public LocalDate getMeetingDate() {
        return meetingDate;
    }

    public void setMeetingDate(LocalDate meetingDate) {
        this.meetingDate = meetingDate;
    }

    public Integer getMeetingNumber() {
        return meetingNumber;
    }

    public void setMeetingNumber(Integer meetingNumber) {
        this.meetingNumber = meetingNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}