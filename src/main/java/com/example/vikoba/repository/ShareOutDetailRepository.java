package com.example.vikoba.repository;

import com.example.vikoba.entity.ShareOutDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShareOutDetailRepository extends JpaRepository<ShareOutDetail, Long> {

    List<ShareOutDetail> findByShareOutId(Long shareOutId);

    List<ShareOutDetail> findByMemberId(Long memberId);

    Optional<ShareOutDetail> findByShareOutIdAndMemberId(
            Long shareOutId,
            Long memberId
    );

    List<ShareOutDetail> findByPaymentStatus(String paymentStatus);
}