package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.dto.auth.AuthResponse;
import com.pingpost.pingpostBackend.dto.auth.LoginRequest;
import com.pingpost.pingpostBackend.dto.auth.RegisterRequest;
import com.pingpost.pingpostBackend.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}