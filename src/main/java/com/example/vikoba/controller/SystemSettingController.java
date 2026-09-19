package com.example.vikoba.controller;

import com.example.vikoba.entity.SystemSetting;
import com.example.vikoba.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public SystemSettingController(
            SystemSettingService systemSettingService
    ) {
        this.systemSettingService = systemSettingService;
    }

    /*
     * ADMIN ONLY
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSetting> createSetting(
            @RequestBody SystemSetting setting
    ) {
        return ResponseEntity.ok(
                systemSettingService.saveSetting(setting)
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(
                systemSettingService.getAllSettings()
        );
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SystemSetting> getSettingById(
            @PathVariable Long id
    ) {
        return systemSettingService.getSettingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * USER + ADMIN
     */
    @GetMapping("/key/{key}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<SystemSetting> getSettingByKey(
            @PathVariable String key
    ) {
        return systemSettingService.getSettingByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /*
     * ADMIN ONLY
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable Long id,
            @RequestBody SystemSetting setting
    ) {
        return ResponseEntity.ok(
                systemSettingService.updateSetting(
                        id,
                        setting
                )
        );
    }

    /*
     * ADMIN ONLY
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSetting(
            @PathVariable Long id
    ) {
        systemSettingService.deleteSetting(id);

        return ResponseEntity.noContent().build();
    }
}