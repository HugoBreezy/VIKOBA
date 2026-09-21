package com.example.vikoba.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // PUBLIC AUTH ENDPOINTS
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users/register",
                                "/api/users/login",
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()


                        // =========================
                        // USERS
                        // =========================
                        .requestMatchers(
                                "/api/users/**"
                        ).hasRole("ADMIN")


                        // =========================
                        // SHARE-OUT DETAILS
                        // =========================

                        // ADMIN can create
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/share-out-details"
                        ).hasRole("ADMIN")

                        // ADMIN can update
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/share-out-details/**"
                        ).hasRole("ADMIN")

                        // ADMIN can delete
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/share-out-details/**"
                        ).hasRole("ADMIN")

                        // USER and ADMIN can view
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/share-out-details/**"
                        ).hasAnyRole("USER", "ADMIN")


                        // =========================
                        // EVERYTHING ELSE
                        // =========================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}