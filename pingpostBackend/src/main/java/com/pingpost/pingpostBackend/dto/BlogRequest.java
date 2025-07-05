package com.pingpost.pingpostBackend.dto;

import lombok.Data;
import java.util.Set;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private String imageUrl;
    private Set<String> hashtags;
} 