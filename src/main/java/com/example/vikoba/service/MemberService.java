package com.example.vikoba.service;

import com.example.vikoba.entity.Member;
import com.example.vikoba.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(
            MemberRepository memberRepository
    ) {
        this.memberRepository = memberRepository;
    }

    /*
     * Create a new member.
     */
    public Member saveMember(Member member) {

        validateMember(member);

        /*
         * Member number must be unique.
         */
        if (memberRepository.existsByMemberNumber(
                member.getMemberNumber()
        )) {

            throw new IllegalArgumentException(
                    "Member number already exists: "
                            + member.getMemberNumber()
            );
        }

        /*
         * Phone number must be unique.
         */
        if (memberRepository.existsByPhone(
                member.getPhone()
        )) {

            throw new IllegalArgumentException(
                    "Phone number already exists: "
                            + member.getPhone()
            );
        }

        /*
         * New members are ACTIVE by default.
         */
        if (member.getStatus() == null ||
                member.getStatus().isBlank()) {

            member.setStatus("ACTIVE");

        } else {

            member.setStatus(
                    member.getStatus().toUpperCase()
            );
        }

        return memberRepository.save(member);
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(
            Long id
    ) {
        return memberRepository.findById(id);
    }

    public Optional<Member> getMemberByNumber(
            String memberNumber
    ) {
        return memberRepository.findByMemberNumber(
                memberNumber
        );
    }

    public Optional<Member> getMemberByPhone(
            String phone
    ) {
        return memberRepository.findByPhone(phone);
    }

    public boolean memberNumberExists(
            String memberNumber
    ) {

        if (memberNumber == null ||
                memberNumber.isBlank()) {

            return false;
        }

        return memberRepository.existsByMemberNumber(
                memberNumber
        );
    }

    public boolean phoneExists(
            String phone
    ) {

        if (phone == null ||
                phone.isBlank()) {

            return false;
        }

        return memberRepository.existsByPhone(phone);
    }

    /*
     * Update an existing member.
     */
    public Member updateMember(
            Long id,
            Member updatedMember
    ) {

        Member existingMember =
                memberRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Member not found with id: "
                                                + id
                                )
                        );

        validateMember(updatedMember);

        /*
         * Check duplicate member number,
         * excluding the current member.
         */
        if (!existingMember.getMemberNumber()
                .equals(updatedMember.getMemberNumber()) &&
                memberRepository.existsByMemberNumber(
                        updatedMember.getMemberNumber()
                )) {

            throw new IllegalArgumentException(
                    "Member number already exists: "
                            + updatedMember.getMemberNumber()
            );
        }

        /*
         * Check duplicate phone,
         * excluding the current member.
         */
        if (!existingMember.getPhone()
                .equals(updatedMember.getPhone()) &&
                memberRepository.existsByPhone(
                        updatedMember.getPhone()
                )) {

            throw new IllegalArgumentException(
                    "Phone number already exists: "
                            + updatedMember.getPhone()
            );
        }

        existingMember.setMemberNumber(
                updatedMember.getMemberNumber()
        );

        existingMember.setFullName(
                updatedMember.getFullName()
        );

        existingMember.setPhone(
                updatedMember.getPhone()
        );

        existingMember.setEmail(
                updatedMember.getEmail()
        );

        existingMember.setGender(
                updatedMember.getGender()
        );

        existingMember.setAddress(
                updatedMember.getAddress()
        );

        existingMember.setJoinDate(
                updatedMember.getJoinDate()
        );

        existingMember.setStatus(
                updatedMember.getStatus().toUpperCase()
        );

        existingMember.setUser(
                updatedMember.getUser()
        );

        return memberRepository.save(
                existingMember
        );
    }

    /*
     * Delete a member.
     */
    public void deleteMember(Long id) {

        if (!memberRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Member not found with id: " + id
            );
        }

        memberRepository.deleteById(id);
    }

    /*
     * Validate member information.
     */
    private void validateMember(
            Member member
    ) {

        if (member == null) {

            throw new IllegalArgumentException(
                    "Member data cannot be null"
            );
        }

        /*
         * Member number is required.
         */
        if (member.getMemberNumber() == null ||
                member.getMemberNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "Member number is required"
            );
        }

        /*
         * Full name is required.
         */
        if (member.getFullName() == null ||
                member.getFullName().isBlank()) {

            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }

        /*
         * Phone is required.
         */
        if (member.getPhone() == null ||
                member.getPhone().isBlank()) {

            throw new IllegalArgumentException(
                    "Phone number is required"
            );
        }

        /*
         * Join date is required.
         */
        if (member.getJoinDate() == null) {

            throw new IllegalArgumentException(
                    "Join date is required"
            );
        }

        /*
         * Join date cannot be in the future.
         */
        if (member.getJoinDate()
                .isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Join date cannot be in the future"
            );
        }

        /*
         * Validate member status.
         */
        if (member.getStatus() != null &&
                !member.getStatus().isBlank()) {

            String status =
                    member.getStatus().toUpperCase();

            if (!status.equals("ACTIVE") &&
                    !status.equals("INACTIVE") &&
                    !status.equals("SUSPENDED")) {

                throw new IllegalArgumentException(
                        "Invalid member status. "
                                + "Allowed values: ACTIVE, INACTIVE, SUSPENDED"
                );
            }

            /*
             * Store status consistently in uppercase.
             */
            member.setStatus(status);
        }
    }
}