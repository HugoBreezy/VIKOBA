package com.example.vikoba.controller;

import com.example.vikoba.entity.Member;
import com.example.vikoba.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Member>> getAllMembers() {

        return ResponseEntity.ok(
                memberService.getAllMembers()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Member> getMemberById(
            @PathVariable Long id
    ) {

        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/number/{memberNumber}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Member> getMemberByNumber(
            @PathVariable String memberNumber
    ) {

        return memberService.getMemberByNumber(memberNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/phone/{phone}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Member> getMemberByPhone(
            @PathVariable String phone
    ) {

        return memberService.getMemberByPhone(phone)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Member> createMember(
            @RequestBody Member member
    ) {

        return ResponseEntity.ok(
                memberService.saveMember(member)
        );
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Member> updateMember(
            @PathVariable Long id,
            @RequestBody Member member
    ) {

        return ResponseEntity.ok(
                memberService.updateMember(id, member)
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMember(
            @PathVariable Long id
    ) {

        memberService.deleteMember(id);

        return ResponseEntity.noContent().build();
    }
}