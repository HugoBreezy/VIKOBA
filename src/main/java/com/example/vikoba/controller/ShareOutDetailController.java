package com.example.vikoba.controller;

import com.example.vikoba.entity.ShareOutDetail;
import com.example.vikoba.service.ShareOutDetailService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<ShareOutDetail> createShareOutDetail(
            @RequestBody ShareOutDetail detail
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.saveShareOutDetail(detail)
        );
    }

    @GetMapping
    public ResponseEntity<List<ShareOutDetail>> getAllShareOutDetails() {
        return ResponseEntity.ok(
                shareOutDetailService.getAllShareOutDetails()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShareOutDetail> getShareOutDetailById(
            @PathVariable Long id
    ) {
        return shareOutDetailService
                .getShareOutDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/share-out/{shareOutId}")
    public ResponseEntity<List<ShareOutDetail>> getDetailsByShareOut(
            @PathVariable Long shareOutId
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.getDetailsByShareOut(
                        shareOutId
                )
        );
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ShareOutDetail>> getDetailsByMember(
            @PathVariable Long memberId
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.getDetailsByMember(
                        memberId
                )
        );
    }

    @GetMapping("/share-out/{shareOutId}/member/{memberId}")
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

    @GetMapping("/payment-status/{paymentStatus}")
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

    @PutMapping("/{id}")
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

    @PatchMapping("/{id}/pay")
    public ResponseEntity<ShareOutDetail> markAsPaid(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                shareOutDetailService.markAsPaid(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShareOutDetail(
            @PathVariable Long id
    ) {
        shareOutDetailService.deleteShareOutDetail(id);

        return ResponseEntity.noContent().build();
    }
}