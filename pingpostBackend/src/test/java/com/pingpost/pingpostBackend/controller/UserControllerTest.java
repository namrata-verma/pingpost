package com.pingpost.pingpostBackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pingpost.pingpostBackend.dto.UserProfileRequest;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.UserRepository;
import com.pingpost.pingpostBackend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private String jwtToken2;
    private User user;
    private User user2;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("user1");
        user.setPassword(passwordEncoder.encode("password"));
        user.setEmail("user1@example.com");
        userRepository.save(user);
        jwtToken = "Bearer " + jwtService.generateToken(user);

        user2 = new User();
        user2.setUsername("user2");
        user2.setPassword(passwordEncoder.encode("password"));
        user2.setEmail("user2@example.com");
        userRepository.save(user2);
        jwtToken2 = "Bearer " + jwtService.generateToken(user2);
    }

    @Test
    void follow_and_unfollow_shouldSucceed() throws Exception {
        // user1 follows user2
        mockMvc.perform(post("/api/users/user2/follow")
                .header("Authorization", jwtToken))
                .andExpect(status().isOk());

        // user1 unfollows user2
        mockMvc.perform(post("/api/users/user2/unfollow")
                .header("Authorization", jwtToken))
                .andExpect(status().isOk());
    }
} 