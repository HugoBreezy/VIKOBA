package com.example.vikoba.service;

import com.example.vikoba.entity.User;
import com.example.vikoba.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /*
     * Create a new user.
     *
     * Public registration must ALWAYS create USER.
     * The client is not allowed to choose ADMIN role.
     */
    public User saveUser(User user) {

        validateUser(user);

        /*
         * Username must be unique.
         */
        if (userRepository.existsByUsername(
                user.getUsername()
        )) {

            throw new IllegalArgumentException(
                    "Username already exists: "
                            + user.getUsername()
            );
        }

        /*
         * Public registration always creates USER.
         *
         * Even if the client sends:
         * "role": "ADMIN"
         *
         * it will be ignored.
         */
        user.setRole("USER");

        /*
         * Encode password before saving.
         */
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        /*
         * Automatically set creation time.
         */
        if (user.getCreatedAt() == null) {

            user.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(
            Long id
    ) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(
            String username
    ) {
        return userRepository.findByUsername(
                username
        );
    }

    public boolean usernameExists(
            String username
    ) {

        if (username == null ||
                username.isBlank()) {

            return false;
        }

        return userRepository.existsByUsername(
                username
        );
    }

    /*
     * Update an existing user.
     *
     * This endpoint is protected by ADMIN role
     * in SecurityConfig.
     */
    public User updateUser(
            Long id,
            User updatedUser
    ) {

        User existingUser =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found with id: "
                                                + id
                                )
                        );

        validateUser(updatedUser);

        /*
         * Check duplicate username while excluding
         * the current user.
         */
        if (!existingUser.getUsername()
                .equals(updatedUser.getUsername()) &&
                userRepository.existsByUsername(
                        updatedUser.getUsername()
                )) {

            throw new IllegalArgumentException(
                    "Username already exists: "
                            + updatedUser.getUsername()
            );
        }

        existingUser.setUsername(
                updatedUser.getUsername()
        );

        /*
         * Encode the new password before saving.
         */
        existingUser.setPassword(
                passwordEncoder.encode(
                        updatedUser.getPassword()
                )
        );

        /*
         * Keep existing role if no role is supplied.
         */
        if (updatedUser.getRole() == null ||
                updatedUser.getRole().isBlank()) {

            existingUser.setRole(
                    existingUser.getRole()
            );

        } else {

            existingUser.setRole(
                    updatedUser.getRole().toUpperCase()
            );
        }

        return userRepository.save(
                existingUser
        );
    }

    /*
     * Delete a user.
     */
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "User not found with id: " + id
            );
        }

        userRepository.deleteById(id);
    }

    /*
     * Validate user information.
     */
    private void validateUser(
            User user
    ) {

        if (user == null) {

            throw new IllegalArgumentException(
                    "User data cannot be null"
            );
        }

        /*
         * Username is required.
         */
        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            throw new IllegalArgumentException(
                    "Username is required"
            );
        }

        /*
         * Password is required.
         */
        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        /*
         * Validate role only when supplied.
         *
         * saveUser() will still force USER for
         * public registration.
         */
        if (user.getRole() != null &&
                !user.getRole().isBlank()) {

            String role =
                    user.getRole().toUpperCase();

            if (!role.equals("USER") &&
                    !role.equals("ADMIN")) {

                throw new IllegalArgumentException(
                        "Invalid role. "
                                + "Allowed values: USER, ADMIN"
                );
            }

            user.setRole(role);
        }
    }
}