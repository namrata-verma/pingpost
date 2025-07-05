package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.UserRepository;
import com.pingpost.pingpostBackend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class BlogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        // Create a test user in H2
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setEmail("testuser@example.com");
        userRepository.save(user);

        // Generate JWT for the test user
        jwtToken = "Bearer " + jwtService.generateToken(user);
    }

    @Test
    void getAllBlogs_withAuth_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/blogs/all")
                .header("Authorization", jwtToken))
                .andExpect(status().isOk());
    }
} 