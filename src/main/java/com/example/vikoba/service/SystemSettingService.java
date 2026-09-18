package com.example.vikoba.service;

import com.example.vikoba.entity.SystemSetting;
import com.example.vikoba.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingService(
            SystemSettingRepository systemSettingRepository
    ) {
        this.systemSettingRepository = systemSettingRepository;
    }

    public SystemSetting saveSetting(SystemSetting setting) {

        if (setting.getUpdatedAt() == null) {
            setting.setUpdatedAt(LocalDateTime.now());
        }

        return systemSettingRepository.save(setting);
    }

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public Optional<SystemSetting> getSettingById(Long id) {
        return systemSettingRepository.findById(id);
    }

    public Optional<SystemSetting> getSettingByKey(String key) {
        return systemSettingRepository.findBySettingKey(key);
    }

    public boolean settingExists(String key) {
        return systemSettingRepository.existsBySettingKey(key);
    }

    public String getSettingValue(String key) {

        return systemSettingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElseThrow(() ->
                        new RuntimeException(
                                "System setting not found: " + key
                        )
                );
    }

    public int getIntSetting(String key) {

        return Integer.parseInt(
                getSettingValue(key)
        );
    }

    public BigDecimal getDecimalSetting(String key) {

        return new BigDecimal(
                getSettingValue(key)
        );
    }

    public SystemSetting updateSetting(
            Long id,
            SystemSetting updatedSetting
    ) {

        SystemSetting existingSetting =
                systemSettingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Setting not found with id: " + id
                                )
                        );

        existingSetting.setSettingKey(
                updatedSetting.getSettingKey()
        );

        existingSetting.setSettingValue(
                updatedSetting.getSettingValue()
        );

        existingSetting.setDescription(
                updatedSetting.getDescription()
        );

        existingSetting.setUpdatedAt(
                LocalDateTime.now()
        );

        return systemSettingRepository.save(existingSetting);
    }

    public void deleteSetting(Long id) {

        if (!systemSettingRepository.existsById(id)) {
            throw new RuntimeException(
                    "Setting not found with id: " + id
            );
        }

        systemSettingRepository.deleteById(id);
    }
}