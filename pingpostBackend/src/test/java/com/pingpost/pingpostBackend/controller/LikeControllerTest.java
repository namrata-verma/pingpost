package com.pingpost.pingpostBackend.controller;

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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class LikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
        // Create blog author
        User blogAuthor = new User();
        blogAuthor.setUsername("blogauthor");
        blogAuthor.setPassword(passwordEncoder.encode("password"));
        blogAuthor.setEmail("blogauthor@example.com");
        userRepository.save(blogAuthor);

        // Create liker (different user)
        User liker = new User();
        liker.setUsername("likeuser");
        liker.setPassword(passwordEncoder.encode("password"));
        liker.setEmail("likeuser@example.com");
        userRepository.save(liker);
        jwtToken = "Bearer " + jwtService.generateToken(liker);

        // Create blog authored by blogAuthor
        Blog blog = new Blog();
        blog.setTitle("Like Blog");
        blog.setContent("Like Content");
        blog.setAuthor(blogAuthor);
        blogRepository.save(blog);
        blogId = blog.getId();
    }

    @Test
    void basicLikeTest_shouldWork() throws Exception {
        // Just test the like endpoint
        mockMvc.perform(post("/api/blogs/" + blogId + "/likes")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void isLikedEndpoint_shouldWork() throws Exception {
        // First like the blog
        mockMvc.perform(post("/api/blogs/" + blogId + "/likes")
                .header("Authorization", jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Then check if liked
        mockMvc.perform(get("/api/blogs/" + blogId + "/likes/is-liked")
                .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
} 