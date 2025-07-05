package com.pingpost.pingpostBackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pingpost.pingpostBackend.dto.auth.LoginRequest;
import com.pingpost.pingpostBackend.dto.auth.RegisterRequest;
import com.pingpost.pingpostBackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void register_and_login_shouldReturnOk() throws Exception {
        // Register a new user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("integrationuser");
        registerRequest.setPassword("password");
        registerRequest.setEmail("integrationuser@example.com");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Login with the same user
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("integrationuser");
        loginRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }
} 