package com.example.vikoba.controller;

import com.example.vikoba.entity.ShareOut;
import com.example.vikoba.service.ShareOutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share-outs")
@CrossOrigin(origins = "*")
public class ShareOutController {

    private final ShareOutService shareOutService;

    public ShareOutController(
            ShareOutService shareOutService
    ) {
        this.shareOutService = shareOutService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShareOut> createShareOut(
            @RequestBody ShareOut shareOut
    ) {
        return ResponseEntity.ok(
                shareOutService.saveShareOut(shareOut)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ShareOut>> getAllShareOuts() {
        return ResponseEntity.ok(
                shareOutService.getAllShareOuts()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ShareOut> getShareOutById(
            @PathVariable Long id
    ) {
        return shareOutService.getShareOutById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ShareOut> getShareOutByCycle(
            @PathVariable Long cycleId
    ) {
        return shareOutService.getShareOutByCycle(cycleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/cycle/{cycleId}/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ShareOut> getShareOutByCycleAndStatus(
            @PathVariable Long cycleId,
            @PathVariable String status
    ) {
        return shareOutService
                .getShareOutByCycleAndStatus(
                        cycleId,
                        status
                )
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShareOut> updateShareOut(
            @PathVariable Long id,
            @RequestBody ShareOut shareOut
    ) {
        return ResponseEntity.ok(
                shareOutService.updateShareOut(
                        id,
                        shareOut
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShareOut(
            @PathVariable Long id
    ) {
        shareOutService.deleteShareOut(id);

        return ResponseEntity.noContent().build();
    }
}