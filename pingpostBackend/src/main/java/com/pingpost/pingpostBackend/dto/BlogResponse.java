package com.pingpost.pingpostBackend.dto;

import com.pingpost.pingpostBackend.entity.User;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class BlogResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private AuthorDTO author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int likeCount;
    private int commentCount;
    private Set<String> hashtags;
} 