package com.pingpost.pingpostBackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private String authorUsername;
    private LocalDateTime createdAt;
    private Long blogId;
} 