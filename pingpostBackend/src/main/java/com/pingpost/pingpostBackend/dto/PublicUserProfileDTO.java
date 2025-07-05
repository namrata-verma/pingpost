package com.pingpost.pingpostBackend.dto;

import lombok.Data;

@Data
public class PublicUserProfileDTO {
    private String username;
    private String fullName;
    private String bio;
    private String profilePicture;
} 