package com.pingpost.pingpostBackend.controller;

import com.pingpost.pingpostBackend.dto.BlogResponse;
import com.pingpost.pingpostBackend.dto.CommentResponse;
import com.pingpost.pingpostBackend.dto.UserProfileRequest;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.UserRepository;
import com.pingpost.pingpostBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.pingpost.pingpostBackend.dto.PublicUserProfileDTO;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @PutMapping("/me")
    public ResponseEntity<PublicUserProfileDTO> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserProfileRequest request
    ) {
        User updated = userService.updateProfile(user, request);
        PublicUserProfileDTO dto = new PublicUserProfileDTO();
        dto.setUsername(updated.getUsername());
        dto.setFullName(updated.getFullName());
        dto.setBio(updated.getBio());
        dto.setProfilePicture(updated.getProfilePicture());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/me/likes")
    public ResponseEntity<List<BlogResponse>> getLikedBlogs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getLikedBlogs(user));
    }

    @GetMapping("/me/comments")
    public ResponseEntity<List<CommentResponse>> getUserComments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserComments(user));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PublicUserProfileDTO>> searchUsers(@RequestParam String q) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(q, q);
        List<PublicUserProfileDTO> dtos = users.stream().map(user -> {
            PublicUserProfileDTO dto = new PublicUserProfileDTO();
            dto.setUsername(user.getUsername());
            dto.setFullName(user.getFullName());
            dto.setBio(user.getBio());
            dto.setProfilePicture(user.getProfilePicture());
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/public/{username}")
    public ResponseEntity<PublicUserProfileDTO> getPublicProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PublicUserProfileDTO dto = new PublicUserProfileDTO();
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setBio(user.getBio());
        dto.setProfilePicture(user.getProfilePicture());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Void> followUser(@AuthenticationPrincipal User currentUser, @PathVariable String username) {
        userService.followUser(currentUser, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{username}/unfollow")
    public ResponseEntity<Void> unfollowUser(@AuthenticationPrincipal User currentUser, @PathVariable String username) {
        userService.unfollowUser(currentUser, username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/followers/count")
    public ResponseEntity<Long> getFollowersCount(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowersCount(username));
    }

    @GetMapping("/{username}/following/count")
    public ResponseEntity<Long> getFollowingCount(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowingCount(username));
    }

    @GetMapping("/{username}/is-following")
    public ResponseEntity<Boolean> isFollowing(@AuthenticationPrincipal User currentUser, @PathVariable String username) {
        return ResponseEntity.ok(userService.isFollowing(currentUser, username));
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<PublicUserProfileDTO>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowers(username));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<PublicUserProfileDTO>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowing(username));
    }
} 