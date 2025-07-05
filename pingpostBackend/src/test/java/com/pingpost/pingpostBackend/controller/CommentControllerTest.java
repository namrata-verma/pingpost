package com.pingpost.pingpostBackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pingpost.pingpostBackend.dto.CommentRequest;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.BlogRepository;
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

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Long blogId;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUsername("commentuser");
        user.setPassword(passwordEncoder.encode("password"));
        user.setEmail("commentuser@example.com");
        userRepository.save(user);
        jwtToken = "Bearer " + jwtService.generateToken(user);

        Blog blog = new Blog();
        blog.setTitle("Test Blog");
        blog.setContent("Test Content");
        blog.setAuthor(user);
        blogRepository.save(blog);
        blogId = blog.getId();
    }

    @Test
    void addGetUpdateDeleteComment_shouldSucceed() throws Exception {
        // Add comment
        CommentRequest addRequest = new CommentRequest();
        addRequest.setContent("First comment");
        String addResponse = mockMvc.perform(post("/api/blogs/" + blogId + "/comments")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Get comments
        mockMvc.perform(get("/api/blogs/" + blogId + "/comments")
                .header("Authorization", jwtToken))
                .andExpect(status().isOk());

        // Extract commentId from addResponse
        Long commentId = objectMapper.readTree(addResponse).get("id").asLong();

        // Update comment
        CommentRequest updateRequest = new CommentRequest();
        updateRequest.setContent("Updated comment");
        mockMvc.perform(put("/api/blogs/" + blogId + "/comments/" + commentId)
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        // Delete comment
        mockMvc.perform(delete("/api/blogs/" + blogId + "/comments/" + commentId)
                .header("Authorization", jwtToken))
                .andExpect(status().isNoContent());
    }
} 