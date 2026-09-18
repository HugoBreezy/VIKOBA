package com.example.vikoba.repository;

import com.example.vikoba.entity.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    List<Contribution> findByMemberId(Long memberId);

    List<Contribution> findByCycleId(Long cycleId);

    List<Contribution> findByMemberIdAndCycleId(
            Long memberId,
            Long cycleId
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Contribution c
            WHERE c.member.id = :memberId
            AND c.cycle.id = :cycleId
            """)
    BigDecimal findTotalAmountByMemberIdAndCycleId(
            @Param("memberId") Long memberId,
            @Param("cycleId") Long cycleId
    );
}