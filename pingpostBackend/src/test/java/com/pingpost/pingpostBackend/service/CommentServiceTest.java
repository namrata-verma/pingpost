package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.dto.CommentRequest;
import com.pingpost.pingpostBackend.dto.CommentResponse;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.Comment;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.exception.ResourceNotFoundException;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private BlogRepository blogRepository;

    @InjectMocks
    private CommentService commentService;

    private User user;
    private Blog blog;
    private Comment comment;
    private CommentRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        
        blog = new Blog();
        blog.setId(1L);
        blog.setTitle("Test Blog");
        
        comment = new Comment();
        comment.setId(1L);
        comment.setContent("Test comment");
        comment.setAuthor(user);
        comment.setBlog(blog);
        
        request = new CommentRequest();
        request.setContent("Test comment");
    }

    @Test
    void addComment_shouldReturnCommentResponse() {
        when(blogRepository.findById(1L)).thenReturn(Optional.of(blog));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentResponse response = commentService.addComment(1L, request, user);

        assertEquals("Test comment", response.getContent());
        assertEquals("testuser", response.getAuthorUsername());
        assertEquals(1L, response.getBlogId());
    }

    @Test
    void addComment_shouldThrowWhenBlogNotFound() {
        when(blogRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            commentService.addComment(1L, request, user));
    }

    @Test
    void getComments_shouldReturnList() {
        when(commentRepository.findByBlogId(1L)).thenReturn(List.of(comment));

        List<CommentResponse> responses = commentService.getComments(1L);

        assertEquals(1, responses.size());
        assertEquals("Test comment", responses.get(0).getContent());
    }

    @Test
    void updateComment_shouldReturnUpdatedComment() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        CommentRequest updateRequest = new CommentRequest();
        updateRequest.setContent("Updated comment");

        CommentResponse response = commentService.updateComment(1L, 1L, updateRequest, user);

        assertEquals("Updated comment", response.getContent());
    }

    @Test
    void updateComment_shouldThrowWhenNotAuthor() {
        User otherUser = new User();
        otherUser.setId(2L);
        
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        assertThrows(RuntimeException.class, () -> 
            commentService.updateComment(1L, 1L, request, otherUser));
    }

    @Test
    void deleteComment_shouldDeleteWhenAuthor() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        commentService.deleteComment(1L, user);

        verify(commentRepository, times(1)).delete(comment);
    }

    @Test
    void deleteComment_shouldThrowWhenNotAuthor() {
        User otherUser = new User();
        otherUser.setId(2L);
        
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        assertThrows(RuntimeException.class, () -> 
            commentService.deleteComment(1L, otherUser));
    }
} 