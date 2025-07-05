package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.dto.ApiResponse;
import com.pingpost.pingpostBackend.dto.BlogRequest;
import com.pingpost.pingpostBackend.dto.BlogResponse;
import com.pingpost.pingpostBackend.dto.PaginatedResponse;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BlogController {

    private final BlogService blogService;

    @PostMapping
    public ResponseEntity<BlogResponse> publishBlog(
            @RequestBody BlogRequest request,
            @AuthenticationPrincipal User user) {
        BlogResponse response = blogService.publishBlog(request, user.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BlogResponse>> getAllBlogs() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long id,
            @RequestBody BlogRequest request,
            @AuthenticationPrincipal User user) throws AccessDeniedException {
        return ResponseEntity.ok(blogService.updateBlog(id, request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) throws AccessDeniedException {
        blogService.deleteBlog(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<BlogResponse>> getBlogsByUser(@PathVariable String username) {
        return ResponseEntity.ok(blogService.getBlogsByUser(username));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<BlogResponse>> getBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(blogService.getBlogsPaginated(page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BlogResponse>> searchBlogsByHashtag(@RequestParam String hashtag) {
        return ResponseEntity.ok(blogService.getBlogsByHashtag(hashtag));
    }

    @GetMapping("/hashtags")
    public ResponseEntity<List<String>> getHashtagSuggestions(@RequestParam("q") String prefix) {
        return ResponseEntity.ok(blogService.getHashtagSuggestions(prefix));
    }
} 