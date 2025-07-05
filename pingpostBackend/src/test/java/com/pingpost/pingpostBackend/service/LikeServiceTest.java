package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.Like;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.exception.ResourceNotFoundException;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.LikeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LikeServiceTest {
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private BlogRepository blogRepository;

    @InjectMocks
    private LikeService likeService;

    private User user;
    private User blogAuthor;
    private Blog blog;
    private Like like;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        blogAuthor = new User();
        blogAuthor.setId(1L);
        blogAuthor.setUsername("blogauthor");
        
        user = new User();
        user.setId(2L);
        user.setUsername("liker");
        
        blog = new Blog();
        blog.setId(1L);
        blog.setTitle("Test Blog");
        blog.setAuthor(blogAuthor);
        
        like = new Like();
        like.setId(1L);
        like.setUser(user);
        like.setBlog(blog);
    }

    @Test
    void likeBlog_shouldCreateLike() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(likeRepository.existsByUserAndBlog(user, blog)).thenReturn(false);
        when(likeRepository.save(any(Like.class))).thenReturn(like);

        likeService.likeBlog(1L, user);

        verify(likeRepository, times(1)).save(any(Like.class));
    }

    @Test
    void likeBlog_shouldNotCreateDuplicateLike() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(likeRepository.existsByUserAndBlog(user, blog)).thenReturn(true);

        likeService.likeBlog(1L, user);

        verify(likeRepository, never()).save(any(Like.class));
    }

    @Test
    void likeBlog_shouldThrowWhenLikingOwnBlog() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));

        assertThrows(IllegalArgumentException.class, () -> 
            likeService.likeBlog(1L, blogAuthor));
    }

    @Test
    void likeBlog_shouldThrowWhenBlogNotFound() {
        when(blogRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            likeService.likeBlog(1L, user));
    }

    @Test
    void unlikeBlog_shouldDeleteLike() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));

        likeService.unlikeBlog(1L, user);

        verify(likeRepository, times(1)).deleteByUserAndBlog(user, blog);
    }

    @Test
    void getLikeCount_shouldReturnCount() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(likeRepository.countByBlog(blog)).thenReturn(5L);

        long count = likeService.getLikeCount(1L);

        assertEquals(5L, count);
    }

    @Test
    void isBlogLikedByUser_shouldReturnTrue() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(likeRepository.existsByUserAndBlog(user, blog)).thenReturn(true);

        boolean isLiked = likeService.isBlogLikedByUser(1L, user);

        assertTrue(isLiked);
    }

    @Test
    void isBlogLikedByUser_shouldReturnFalse() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(likeRepository.existsByUserAndBlog(user, blog)).thenReturn(false);

        boolean isLiked = likeService.isBlogLikedByUser(1L, user);

        assertFalse(isLiked);
    }
} 