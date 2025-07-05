package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.dto.BlogRequest;
import com.pingpost.pingpostBackend.dto.BlogResponse;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.UserRepository;
import com.pingpost.pingpostBackend.repository.LikeRepository;
import com.pingpost.pingpostBackend.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BlogServiceTest {
    @Mock
    private BlogRepository blogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private BlogService blogService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void publishBlog_shouldReturnBlogResponse() {
        BlogRequest request = new BlogRequest();
        request.setTitle("Test Title");
        request.setContent("Test Content #tag");
        User user = new User();
        user.setUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        Blog blog = new Blog();
        blog.setId(1L);
        blog.setTitle(request.getTitle());
        blog.setContent(request.getContent());
        blog.setAuthor(user);
        when(blogRepository.save(any(Blog.class))).thenReturn(blog);
        BlogResponse response = blogService.publishBlog(request, "testuser");
        assertEquals("Test Title", response.getTitle());
        assertEquals("Test Content #tag", response.getContent());
    }

    @Test
    void publishBlog_shouldThrowIfUserNotFound() {
        BlogRequest request = new BlogRequest();
        when(userRepository.findByUsername("nouser")).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> blogService.publishBlog(request, "nouser"));
    }

    @Test
    void getAllBlogs_shouldReturnList() {
        Blog blog = new Blog();
        blog.setId(1L);
        blog.setTitle("Blog1");
        blog.setContent("Content1");
        User user = new User();
        user.setUsername("testuser");
        blog.setAuthor(user);
        when(blogRepository.findAll()).thenReturn(List.of(blog));
        when(likeRepository.countByBlog(blog)).thenReturn(0L);
        when(commentRepository.countByBlog(blog)).thenReturn(0L);
        List<BlogResponse> result = blogService.getAllBlogs();
        assertEquals(1, result.size());
        assertEquals("Blog1", result.get(0).getTitle());
    }
} 