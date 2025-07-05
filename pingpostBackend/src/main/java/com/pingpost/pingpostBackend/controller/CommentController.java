package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.dto.CommentRequest;
import com.pingpost.pingpostBackend.dto.CommentResponse;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs/{blogId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long blogId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.addComment(blogId, request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long blogId) {
        return ResponseEntity.ok(commentService.getComments(blogId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long blogId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long blogId,
            @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.updateComment(blogId, commentId, request, user);
        return ResponseEntity.ok(response);
    }
} 