package com.example.vikoba.controller;

import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.service.ShareOutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share-outs")
@CrossOrigin(origins = "*")
public class ShareOutController {

    private final ShareOutService shareOutService;

    public ShareOutController(ShareOutService shareOutService) {
        this.shareOutService = shareOutService;
    }

    @PostMapping
    public ResponseEntity<ShareOut> createShareOut(
            @RequestBody ShareOut shareOut
    ) {
        return ResponseEntity.ok(
                shareOutService.saveShareOut(shareOut)
        );
    }

    @GetMapping
    public ResponseEntity<List<ShareOut>> getAllShareOuts() {
        return ResponseEntity.ok(
                shareOutService.getAllShareOuts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShareOut> getShareOutById(
            @PathVariable Long id
    ) {
        return shareOutService.getShareOutById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<ShareOut> getShareOutByCycle(
            @PathVariable Long cycleId
    ) {
        return shareOutService.getShareOutByCycle(cycleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cycle/{cycleId}/status/{status}")
    public ResponseEntity<ShareOut> getShareOutByCycleAndStatus(
            @PathVariable Long cycleId,
            @PathVariable String status
    ) {
        return shareOutService
                .getShareOutByCycleAndStatus(cycleId, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShareOut> updateShareOut(
            @PathVariable Long id,
            @RequestBody ShareOut shareOut
    ) {
        return ResponseEntity.ok(
                shareOutService.updateShareOut(id, shareOut)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShareOut(
            @PathVariable Long id
    ) {
        shareOutService.deleteShareOut(id);

        return ResponseEntity.noContent().build();
    }
}