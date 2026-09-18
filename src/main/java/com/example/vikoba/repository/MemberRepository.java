package com.example.vikoba.repository;

import com.example.vikoba.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByMemberNumber(String memberNumber);

    Optional<Member> findByPhone(String phone);

    boolean existsByMemberNumber(String memberNumber);

    boolean existsByPhone(String phone);
}