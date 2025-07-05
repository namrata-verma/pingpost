package com.pingpost.pingpostBackend.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String bio;
    private String profilePicture;
} 