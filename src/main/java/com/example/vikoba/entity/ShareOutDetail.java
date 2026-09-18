package com.example.vikoba.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
        name = "share_out_details",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_share_out_detail_member",
                        columnNames = {"share_out_id", "member_id"}
                )
        }
)
public class ShareOutDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "share_out_id", nullable = false)
    private ShareOut shareOut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(
            name = "member_contribution",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal memberContribution;

    @Column(
            name = "contribution_percentage",
            nullable = false,
            precision = 7,
            scale = 4
    )
    private BigDecimal contributionPercentage;

    @Column(
            name = "member_profit",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal memberProfit;

    @Column(
            name = "share_out_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal shareOutAmount;

    @Column(nullable = false, length = 20)
    private String paymentStatus = "PENDING";

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(length = 500)
    private String notes;

    public ShareOutDetail() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ShareOut getShareOut() {
        return shareOut;
    }

    public void setShareOut(ShareOut shareOut) {
        this.shareOut = shareOut;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public BigDecimal getMemberContribution() {
        return memberContribution;
    }

    public void setMemberContribution(BigDecimal memberContribution) {
        this.memberContribution = memberContribution;
    }

    public BigDecimal getContributionPercentage() {
        return contributionPercentage;
    }

    public void setContributionPercentage(BigDecimal contributionPercentage) {
        this.contributionPercentage = contributionPercentage;
    }

    public BigDecimal getMemberProfit() {
        return memberProfit;
    }

    public void setMemberProfit(BigDecimal memberProfit) {
        this.memberProfit = memberProfit;
    }

    public BigDecimal getShareOutAmount() {
        return shareOutAmount;
    }

    public void setShareOutAmount(BigDecimal shareOutAmount) {
        this.shareOutAmount = shareOutAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}