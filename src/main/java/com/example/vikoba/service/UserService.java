package com.example.vikoba.service;

import com.example.vikoba.entity.User;
import com.example.vikoba.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    /*
     * Create a new user.
     */
    public User saveUser(User user) {

        validateUser(user);

        /*
         * Username must be unique.
         */
        if (userRepository.existsByUsername(
                user.getUsername()
        )) {

            throw new RuntimeException(
                    "Username already exists: "
                            + user.getUsername()
            );
        }

        /*
         * Default role.
         */
        if (user.getRole() == null ||
                user.getRole().isBlank()) {

            user.setRole("USER");
        } else {

            user.setRole(
                    user.getRole().toUpperCase()
            );
        }

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
     */
    public User updateUser(
            Long id,
            User updatedUser
    ) {

        User existingUser =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
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

            throw new RuntimeException(
                    "Username already exists: "
                            + updatedUser.getUsername()
            );
        }

        existingUser.setUsername(
                updatedUser.getUsername()
        );

        existingUser.setPassword(
                updatedUser.getPassword()
        );

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

            throw new RuntimeException(
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

            throw new RuntimeException(
                    "User data cannot be null"
            );
        }

        /*
         * Username is required.
         */
        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            throw new RuntimeException(
                    "Username is required"
            );
        }

        /*
         * Password is required.
         */
        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        /*
         * Validate role if supplied.
         */
        if (user.getRole() != null &&
                !user.getRole().isBlank()) {

            String role =
                    user.getRole().toUpperCase();

            if (!role.equals("USER") &&
                    !role.equals("ADMIN")) {

                throw new RuntimeException(
                        "Invalid role. "
                                + "Allowed values: USER, ADMIN"
                );
            }

            user.setRole(role);
        }
    }
}