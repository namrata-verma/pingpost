package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.dto.CommentRequest;
import com.pingpost.pingpostBackend.dto.CommentResponse;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.Comment;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.exception.ResourceNotFoundException;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final BlogRepository blogRepository;

    @Transactional
    public CommentResponse addComment(Long blogId, CommentRequest request, User user) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(user);
        comment.setBlog(blog);
        Comment saved = commentRepository.save(comment);
        return toResponse(saved);
    }

    public List<CommentResponse> getComments(Long blogId) {
        return commentRepository.findByBlogId(blogId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("You are not the author of this comment");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long blogId, Long commentId, CommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("You are not the author of this comment");
        }
        if (!comment.getBlog().getId().equals(blogId)) {
            throw new ResourceNotFoundException("Comment not found in this blog");
        }
        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);
        return toResponse(updated);
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse resp = new CommentResponse();
        resp.setId(comment.getId());
        resp.setContent(comment.getContent());
        resp.setAuthorUsername(comment.getAuthor().getUsername());
        resp.setCreatedAt(comment.getCreatedAt());
        resp.setBlogId(comment.getBlog().getId());
        return resp;
    }
} 