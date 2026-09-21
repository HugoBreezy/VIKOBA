package com.example.vikoba.service;

import com.example.vikoba.entity.Contribution;
import com.example.vikoba.entity.Expense;
import com.example.vikoba.entity.Loan;
import com.example.vikoba.entity.LoanInstallment;
import com.example.vikoba.entity.LoanPayment;
import com.example.vikoba.entity.Member;
import com.example.vikoba.entity.Penalty;
import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.entity.ShareOutDetail;
import com.example.vikoba.repository.ContributionRepository;
import com.example.vikoba.repository.ExpenseRepository;
import com.example.vikoba.repository.LoanInstallmentRepository;
import com.example.vikoba.repository.LoanPaymentRepository;
import com.example.vikoba.repository.LoanRepository;
import com.example.vikoba.repository.MemberRepository;
import com.example.vikoba.repository.PenaltyRepository;
import com.example.vikoba.repository.ShareOutDetailRepository;
import com.example.vikoba.repository.ShareOutRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final ContributionRepository contributionRepository;
    private final LoanRepository loanRepository;
    private final ExpenseRepository expenseRepository;
    private final MemberRepository memberRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final LoanPaymentRepository loanPaymentRepository;
    private final PenaltyRepository penaltyRepository;
    private final ShareOutRepository shareOutRepository;
    private final ShareOutDetailRepository shareOutDetailRepository;

    public ReportService(
            ContributionRepository contributionRepository,
            LoanRepository loanRepository,
            ExpenseRepository expenseRepository,
            MemberRepository memberRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            LoanPaymentRepository loanPaymentRepository,
            PenaltyRepository penaltyRepository,
            ShareOutRepository shareOutRepository,
            ShareOutDetailRepository shareOutDetailRepository
    ) {
        this.contributionRepository = contributionRepository;
        this.loanRepository = loanRepository;
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.loanPaymentRepository = loanPaymentRepository;
        this.penaltyRepository = penaltyRepository;
        this.shareOutRepository = shareOutRepository;
        this.shareOutDetailRepository = shareOutDetailRepository;
    }

    // =========================================================
    // 1. CYCLE FINANCIAL REPORT
    // =========================================================

    public Map<String, Object> getCycleFinancialReport(Long cycleId) {

        List<Contribution> contributions =
                contributionRepository.findByCycleId(cycleId);

        List<Loan> loans =
                loanRepository.findByCycleId(cycleId);

        List<Expense> expenses =
                expenseRepository.findByCycleId(cycleId);

        BigDecimal totalContributions = contributions.stream()
                .map(Contribution::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLoanInterest = loans.stream()
                .map(Loan::getInterestAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit =
                totalLoanInterest.subtract(totalExpenses);

        if (netProfit.compareTo(BigDecimal.ZERO) < 0) {
            netProfit = BigDecimal.ZERO;
        }

        BigDecimal totalShareOut =
                totalContributions.add(netProfit);

        Map<String, Object> report = new HashMap<>();

        report.put("cycleId", cycleId);
        report.put("totalContributions", totalContributions);
        report.put("totalLoanInterest", totalLoanInterest);
        report.put("totalExpenses", totalExpenses);
        report.put("netProfit", netProfit);
        report.put("totalShareOut", totalShareOut);
        report.put("numberOfContributions", contributions.size());
        report.put("numberOfLoans", loans.size());
        report.put("numberOfExpenses", expenses.size());

        return report;
    }

    // =========================================================
    // 2. MEMBER REPORT
    // =========================================================

    public Map<String, Object> getMemberReport(
            Long memberId,
            Long cycleId
    ) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Member not found with id: " + memberId
                        )
                );

        List<Contribution> contributions =
                contributionRepository.findByMemberIdAndCycleId(
                        memberId,
                        cycleId
                );

        List<Loan> loans =
                loanRepository.findByMemberIdAndCycleId(
                        memberId,
                        cycleId
                );

        BigDecimal totalContributions = contributions.stream()
                .map(Contribution::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPrincipalBorrowed = loans.stream()
                .map(Loan::getPrincipalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLoanInterest = loans.stream()
                .map(Loan::getInterestAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLoanAmount = loans.stream()
                .map(Loan::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> report = new HashMap<>();

        report.put("memberId", member.getId());
        report.put("memberName", member.getFullName());
        report.put("memberNumber", member.getMemberNumber());
        report.put("cycleId", cycleId);

        report.put("totalContributions", totalContributions);
        report.put("numberOfContributions", contributions.size());

        report.put("numberOfLoans", loans.size());
        report.put("totalPrincipalBorrowed", totalPrincipalBorrowed);
        report.put("totalLoanInterest", totalLoanInterest);
        report.put("totalLoanAmount", totalLoanAmount);

        return report;
    }

    // =========================================================
    // 3. LOAN REPORT
    // =========================================================

    public Map<String, Object> getLoanReport(Long loanId) {

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Loan not found with id: " + loanId
                        )
                );

        List<LoanInstallment> installments =
                loanInstallmentRepository.findByLoanId(loanId);

        BigDecimal totalPaid = BigDecimal.ZERO;

        int paidInstallments = 0;
        int partialInstallments = 0;
        int pendingInstallments = 0;

        List<Map<String, Object>> installmentDetails =
                new ArrayList<>();

        for (LoanInstallment installment : installments) {

            String status = installment.getStatus();

            if ("PAID".equalsIgnoreCase(status)) {
                paidInstallments++;
            } else if ("PARTIAL".equalsIgnoreCase(status)) {
                partialInstallments++;
            } else {
                pendingInstallments++;
            }

            List<LoanPayment> payments =
                    loanPaymentRepository.findByInstallmentId(
                            installment.getId()
                    );

            BigDecimal installmentPaid =
                    payments.stream()
                            .map(LoanPayment::getAmount)
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            totalPaid = totalPaid.add(installmentPaid);

            Map<String, Object> detail = new HashMap<>();

            detail.put("installmentId", installment.getId());
            detail.put(
                    "installmentNumber",
                    installment.getInstallmentNumber()
            );
            detail.put("amount", installment.getAmount());
            detail.put("dueDate", installment.getDueDate());
            detail.put("status", installment.getStatus());
            detail.put("paidAmount", installmentPaid);

            installmentDetails.add(detail);
        }

        BigDecimal remainingBalance =
                loan.getTotalAmount().subtract(totalPaid);

        if (remainingBalance.compareTo(BigDecimal.ZERO) < 0) {
            remainingBalance = BigDecimal.ZERO;
        }

        Map<String, Object> report = new HashMap<>();

        report.put("loanId", loan.getId());
        report.put("memberId", loan.getMember().getId());
        report.put("memberName", loan.getMember().getFullName());
        report.put(
                "memberNumber",
                loan.getMember().getMemberNumber()
        );
        report.put("cycleId", loan.getCycle().getId());

        report.put("principalAmount", loan.getPrincipalAmount());
        report.put("interestRate", loan.getInterestRate());
        report.put("interestAmount", loan.getInterestAmount());
        report.put("totalAmount", loan.getTotalAmount());

        report.put("loanDate", loan.getLoanDate());
        report.put("dueDate", loan.getDueDate());
        report.put("status", loan.getStatus());

        report.put(
                "numberOfInstallments",
                installments.size()
        );

        report.put("paidInstallments", paidInstallments);
        report.put("partialInstallments", partialInstallments);
        report.put("pendingInstallments", pendingInstallments);

        report.put("totalPaid", totalPaid);
        report.put("remainingBalance", remainingBalance);

        report.put("installments", installmentDetails);

        return report;
    }

    // =========================================================
    // 4. CONTRIBUTION REPORT
    // =========================================================

    public Map<String, Object> getContributionReport(
            Long cycleId
    ) {

        List<Contribution> contributions =
                contributionRepository.findByCycleId(cycleId);

        BigDecimal totalContributions = contributions.stream()
                .map(Contribution::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> contributionDetails =
                new ArrayList<>();

        for (Contribution contribution : contributions) {

            Map<String, Object> detail = new HashMap<>();

            detail.put(
                    "contributionId",
                    contribution.getId()
            );

            detail.put(
                    "memberId",
                    contribution.getMember().getId()
            );

            detail.put(
                    "memberName",
                    contribution.getMember().getFullName()
            );

            detail.put(
                    "memberNumber",
                    contribution.getMember().getMemberNumber()
            );

            detail.put(
                    "meetingId",
                    contribution.getMeeting().getId()
            );

            detail.put(
                    "meetingNumber",
                    contribution.getMeeting().getMeetingNumber()
            );

            detail.put(
                    "amount",
                    contribution.getAmount()
            );

            detail.put(
                    "contributionDate",
                    contribution.getContributionDate()
            );

            contributionDetails.add(detail);
        }

        Map<String, Object> report = new HashMap<>();

        report.put("cycleId", cycleId);
        report.put("totalContributions", totalContributions);
        report.put(
                "numberOfContributions",
                contributions.size()
        );
        report.put("contributions", contributionDetails);

        return report;
    }

    // =========================================================
    // 5. EXPENSE REPORT
    // =========================================================

    public Map<String, Object> getExpenseReport(
            Long cycleId
    ) {

        List<Expense> expenses =
                expenseRepository.findByCycleId(cycleId);

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> expenseDetails =
                new ArrayList<>();

        for (Expense expense : expenses) {

            Map<String, Object> detail = new HashMap<>();

            detail.put("expenseId", expense.getId());
            detail.put("cycleId", expense.getCycle().getId());
            detail.put("amount", expense.getAmount());
            detail.put(
                    "expenseDate",
                    expense.getExpenseDate()
            );
            detail.put(
                    "description",
                    expense.getDescription()
            );

            if (expense.getRecordedBy() != null) {
                detail.put(
                        "recordedByUserId",
                        expense.getRecordedBy().getId()
                );

                detail.put(
                        "recordedByUsername",
                        expense.getRecordedBy().getUsername()
                );
            }

            expenseDetails.add(detail);
        }

        Map<String, Object> report = new HashMap<>();

        report.put("cycleId", cycleId);
        report.put("totalExpenses", totalExpenses);
        report.put(
                "numberOfExpenses",
                expenses.size()
        );
        report.put("expenses", expenseDetails);

        return report;
    }

    // =========================================================
    // 6. PENALTY REPORT
    // =========================================================

    public Map<String, Object> getPenaltyReport() {

        List<Penalty> penalties =
                penaltyRepository.findAll();

        BigDecimal totalPenalties = BigDecimal.ZERO;
        BigDecimal totalPending = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        List<Map<String, Object>> penaltyDetails =
                new ArrayList<>();

        for (Penalty penalty : penalties) {

            BigDecimal amount =
                    penalty.getPenaltyAmount();

            totalPenalties =
                    totalPenalties.add(amount);

            if ("PAID".equalsIgnoreCase(
                    penalty.getStatus()
            )) {
                totalPaid =
                        totalPaid.add(amount);
            } else {
                totalPending =
                        totalPending.add(amount);
            }

            LoanInstallment installment =
                    penalty.getInstallment();

            Loan loan =
                    installment.getLoan();

            Member member =
                    loan.getMember();

            Map<String, Object> detail =
                    new HashMap<>();

            detail.put(
                    "penaltyId",
                    penalty.getId()
            );

            detail.put(
                    "installmentId",
                    installment.getId()
            );

            detail.put(
                    "installmentNumber",
                    installment.getInstallmentNumber()
            );

            detail.put(
                    "loanId",
                    loan.getId()
            );

            detail.put(
                    "memberId",
                    member.getId()
            );

            detail.put(
                    "memberName",
                    member.getFullName()
            );

            detail.put(
                    "memberNumber",
                    member.getMemberNumber()
            );

            detail.put(
                    "penaltyRate",
                    penalty.getPenaltyRate()
            );

            detail.put(
                    "penaltyAmount",
                    penalty.getPenaltyAmount()
            );

            detail.put(
                    "penaltyDate",
                    penalty.getPenaltyDate()
            );

            detail.put(
                    "status",
                    penalty.getStatus()
            );

            detail.put(
                    "notes",
                    penalty.getNotes()
            );

            penaltyDetails.add(detail);
        }

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "totalPenalties",
                totalPenalties
        );

        report.put(
                "totalPending",
                totalPending
        );

        report.put(
                "totalPaid",
                totalPaid
        );

        report.put(
                "numberOfPenalties",
                penalties.size()
        );

        report.put(
                "penalties",
                penaltyDetails
        );

        return report;
    }

    // =========================================================
    // 7. SHARE-OUT REPORT
    // =========================================================

    public Map<String, Object> getShareOutReport(
            Long cycleId
    ) {

        ShareOut shareOut =
                shareOutRepository.findByCycleId(cycleId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Share-out not found for cycle id: "
                                                + cycleId
                                )
                        );

        List<ShareOutDetail> details =
                shareOutDetailRepository.findByShareOutId(
                        shareOut.getId()
                );

        BigDecimal totalMemberContributions =
                details.stream()
                        .map(ShareOutDetail::getMemberContribution)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalMemberProfit =
                details.stream()
                        .map(ShareOutDetail::getMemberProfit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalShareOutAmount =
                details.stream()
                        .map(ShareOutDetail::getShareOutAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalPaid =
                BigDecimal.ZERO;

        BigDecimal totalPending =
                BigDecimal.ZERO;

        List<Map<String, Object>> memberDetails =
                new ArrayList<>();

        for (ShareOutDetail detail : details) {

            BigDecimal shareOutAmount =
                    detail.getShareOutAmount();

            if ("PAID".equalsIgnoreCase(
                    detail.getPaymentStatus()
            )) {
                totalPaid =
                        totalPaid.add(shareOutAmount);
            } else {
                totalPending =
                        totalPending.add(shareOutAmount);
            }

            Member member =
                    detail.getMember();

            Map<String, Object> memberDetail =
                    new HashMap<>();

            memberDetail.put(
                    "shareOutDetailId",
                    detail.getId()
            );

            memberDetail.put(
                    "memberId",
                    member.getId()
            );

            memberDetail.put(
                    "memberName",
                    member.getFullName()
            );

            memberDetail.put(
                    "memberNumber",
                    member.getMemberNumber()
            );

            memberDetail.put(
                    "memberContribution",
                    detail.getMemberContribution()
            );

            memberDetail.put(
                    "contributionPercentage",
                    detail.getContributionPercentage()
            );

            memberDetail.put(
                    "memberProfit",
                    detail.getMemberProfit()
            );

            memberDetail.put(
                    "shareOutAmount",
                    detail.getShareOutAmount()
            );

            memberDetail.put(
                    "paymentStatus",
                    detail.getPaymentStatus()
            );

            memberDetail.put(
                    "paidDate",
                    detail.getPaidDate()
            );

            memberDetail.put(
                    "notes",
                    detail.getNotes()
            );

            memberDetails.add(memberDetail);
        }

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "shareOutId",
                shareOut.getId()
        );

        report.put(
                "cycleId",
                shareOut.getCycle().getId()
        );

        report.put(
                "totalContributions",
                shareOut.getTotalContributions()
        );

        report.put(
                "totalProfit",
                shareOut.getTotalProfit()
        );

        report.put(
                "totalExpenses",
                shareOut.getTotalExpenses()
        );

        report.put(
                "totalShareOut",
                shareOut.getTotalShareOut()
        );

        report.put(
                "shareOutDate",
                shareOut.getShareOutDate()
        );

        report.put(
                "status",
                shareOut.getStatus()
        );

        report.put(
                "notes",
                shareOut.getNotes()
        );

        report.put(
                "numberOfMembers",
                details.size()
        );

        report.put(
                "totalMemberContributions",
                totalMemberContributions
        );

        report.put(
                "totalMemberProfit",
                totalMemberProfit
        );

        report.put(
                "totalShareOutAmount",
                totalShareOutAmount
        );

        report.put(
                "totalPaid",
                totalPaid
        );

        report.put(
                "totalPending",
                totalPending
        );

        report.put(
                "members",
                memberDetails
        );

        return report;
    }
}