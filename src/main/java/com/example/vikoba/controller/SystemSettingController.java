package com.example.vikoba.controller;

import com.example.vikoba.entity.SystemSetting;
import com.example.vikoba.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<SystemSetting> createSetting(
            @RequestBody SystemSetting setting
    ) {
        return ResponseEntity.ok(
                systemSettingService.saveSetting(setting)
        );
    }

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings() {
        return ResponseEntity.ok(
                systemSettingService.getAllSettings()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemSetting> getSettingById(
            @PathVariable Long id
    ) {
        return systemSettingService.getSettingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<SystemSetting> getSettingByKey(
            @PathVariable String key
    ) {
        return systemSettingService.getSettingByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable Long id,
            @RequestBody SystemSetting setting
    ) {
        return ResponseEntity.ok(
                systemSettingService.updateSetting(id, setting)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetting(
            @PathVariable Long id
    ) {
        systemSettingService.deleteSetting(id);

        return ResponseEntity.noContent().build();
    }
}