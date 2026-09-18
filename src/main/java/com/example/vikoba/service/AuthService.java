package com.example.vikoba.service;

import com.example.vikoba.dto.RegisterRequest;
import com.example.vikoba.entity.User;
import com.example.vikoba.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getEmail())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();

        user.setUsername(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole("USER");

        return userRepository.save(user);
    }
}