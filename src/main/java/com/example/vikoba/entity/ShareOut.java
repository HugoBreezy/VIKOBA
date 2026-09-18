package com.example.vikoba.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "share_outs")
public class ShareOut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false, unique = true)
    private FinancialCycle cycle;

    @Column(name = "total_contributions", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalContributions;

    @Column(name = "total_profit", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalProfit;

    @Column(name = "total_expenses", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalExpenses;

    @Column(name = "total_share_out", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalShareOut;

    @Column(name = "share_out_date", nullable = false)
    private LocalDate shareOutDate;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(length = 500)
    private String notes;

    public ShareOut() {
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

    public BigDecimal getTotalContributions() {
        return totalContributions;
    }

    public void setTotalContributions(BigDecimal totalContributions) {
        this.totalContributions = totalContributions;
    }

    public BigDecimal getTotalProfit() {
        return totalProfit;
    }

    public void setTotalProfit(BigDecimal totalProfit) {
        this.totalProfit = totalProfit;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getTotalShareOut() {
        return totalShareOut;
    }

    public void setTotalShareOut(BigDecimal totalShareOut) {
        this.totalShareOut = totalShareOut;
    }

    public LocalDate getShareOutDate() {
        return shareOutDate;
    }

    public void setShareOutDate(LocalDate shareOutDate) {
        this.shareOutDate = shareOutDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}