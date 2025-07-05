package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blogs/{blogId}/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<Void> likeBlog(@PathVariable Long blogId, @AuthenticationPrincipal User user) {
        likeService.likeBlog(blogId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeBlog(@PathVariable Long blogId, @AuthenticationPrincipal User user) {
        likeService.unlikeBlog(blogId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long blogId) {
        return ResponseEntity.ok(likeService.getLikeCount(blogId));
    }

    @GetMapping("/is-liked")
    public ResponseEntity<Boolean> isBlogLikedByUser(@PathVariable Long blogId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(likeService.isBlogLikedByUser(blogId, user));
    }
} 