package com.example.vikoba.controller;

import com.example.vikoba.entity.ShareOutDetail;
import com.example.vikoba.service.ShareOutDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share-out-details")
@CrossOrigin(origins = "*")
public class ShareOutDetailController {

    private final ShareOutDetailService shareOutDetailService;

    public ShareOutDetailController(
            ShareOutDetailService shareOutDetailService
    ) {
        this.shareOutDetailService = shareOutDetailService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShareOutDetail> createShareOutDetail(
            @RequestBody ShareOutDetail detail
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.saveShareOutDetail(detail)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ShareOutDetail>> getAllShareOutDetails() {
        return ResponseEntity.ok(
                shareOutDetailService.getAllShareOutDetails()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ShareOutDetail> getShareOutDetailById(
            @PathVariable Long id
    ) {
        return shareOutDetailService.getShareOutDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/share-out/{shareOutId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ShareOutDetail>> getDetailsByShareOut(
            @PathVariable Long shareOutId
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.getDetailsByShareOut(
                        shareOutId
                )
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ShareOutDetail>> getDetailsByMember(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.getDetailsByMember(
                        memberId
                )
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/share-out/{shareOutId}/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ShareOutDetail> getMemberShareOutDetail(
            @PathVariable Long shareOutId,
            @PathVariable Long memberId
    ) {
        return shareOutDetailService
                .getMemberShareOutDetail(
                        shareOutId,
                        memberId
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/payment-status/{paymentStatus}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ShareOutDetail>>
    getDetailsByPaymentStatus(
            @PathVariable String paymentStatus
    ) {
        return ResponseEntity.ok(
                shareOutDetailService
                        .getDetailsByPaymentStatus(
                                paymentStatus
                        )
        );
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShareOutDetail> updateShareOutDetail(
            @PathVariable Long id,
            @RequestBody ShareOutDetail detail
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.updateShareOutDetail(
                        id,
                        detail
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShareOutDetail(
            @PathVariable Long id
    ) {
        shareOutDetailService.deleteShareOutDetail(id);

        return ResponseEntity.noContent().build();
    }
}