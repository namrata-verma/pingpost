package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.dto.BlogResponse;
import com.pingpost.pingpostBackend.dto.CommentResponse;
import com.pingpost.pingpostBackend.dto.UserProfileRequest;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.Comment;
import com.pingpost.pingpostBackend.entity.Like;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.CommentRepository;
import com.pingpost.pingpostBackend.repository.LikeRepository;
import com.pingpost.pingpostBackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private BlogRepository blogRepository;
    @Mock
    private LikeRepository likeRepository;
    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private User otherUser;
    private Blog blog;
    private Like like;
    private Comment comment;
    private UserProfileRequest profileRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setFullName("Test User");
        user.setFollowers(new HashSet<>());
        user.setFollowing(new HashSet<>());
        
        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");
        otherUser.setFullName("Other User");
        otherUser.setFollowers(new HashSet<>());
        otherUser.setFollowing(new HashSet<>());
        
        blog = new Blog();
        blog.setId(1L);
        blog.setTitle("Test Blog");
        blog.setAuthor(user);
        
        like = new Like();
        like.setId(1L);
        like.setUser(user);
        like.setBlog(blog);
        
        comment = new Comment();
        comment.setId(1L);
        comment.setAuthor(user);
        comment.setBlog(blog);
        comment.setContent("Test comment");
        
        profileRequest = new UserProfileRequest();
        profileRequest.setFullName("Updated Name");
        profileRequest.setBio("Updated Bio");
        profileRequest.setProfilePicture("new-pic.jpg");
    }

    @Test
    void updateProfile_shouldUpdateUser() {
        when(userRepository.save(any(User.class))).thenReturn(user);

        User updated = userService.updateProfile(user, profileRequest);

        assertEquals("Updated Name", updated.getFullName());
        assertEquals("Updated Bio", updated.getBio());
        assertEquals("new-pic.jpg", updated.getProfilePicture());
    }

    @Test
    void getLikedBlogs_shouldReturnBlogList() {
        when(likeRepository.findByUser(user)).thenReturn(List.of(like));
        when(likeRepository.countByBlog(blog)).thenReturn(5L);
        when(commentRepository.countByBlog(blog)).thenReturn(3L);

        List<BlogResponse> responses = userService.getLikedBlogs(user);

        assertEquals(1, responses.size());
        assertEquals("Test Blog", responses.get(0).getTitle());
    }

    @Test
    void getUserComments_shouldReturnCommentList() {
        when(commentRepository.findByAuthor(user)).thenReturn(List.of(comment));

        List<CommentResponse> responses = userService.getUserComments(user);

        assertEquals(1, responses.size());
        assertEquals("Test comment", responses.get(0).getContent());
        assertEquals("testuser", responses.get(0).getAuthorUsername());
    }

    @Test
    void followUser_shouldAddFollower() {
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));
        when(userRepository.save(any(User.class))).thenReturn(otherUser);

        userService.followUser(user, "otheruser");

        verify(userRepository, times(1)).save(otherUser);
    }

    @Test
    void followUser_shouldNotFollowSelf() {
        userService.followUser(user, "testuser");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void unfollowUser_shouldRemoveFollower() {
        otherUser.getFollowers().add(user);
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));
        when(userRepository.save(any(User.class))).thenReturn(otherUser);

        userService.unfollowUser(user, "otheruser");

        verify(userRepository, times(1)).save(otherUser);
    }

    @Test
    void getFollowersCount_shouldReturnCount() {
        otherUser.getFollowers().add(user);
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        long count = userService.getFollowersCount("otheruser");

        assertEquals(1L, count);
    }

    @Test
    void getFollowingCount_shouldReturnCount() {
        user.getFollowing().add(otherUser);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        long count = userService.getFollowingCount("testuser");

        assertEquals(1L, count);
    }

    @Test
    void isFollowing_shouldReturnTrue() {
        otherUser.getFollowers().add(user);
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        boolean isFollowing = userService.isFollowing(user, "otheruser");

        assertTrue(isFollowing);
    }

    @Test
    void isFollowing_shouldReturnFalse() {
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        boolean isFollowing = userService.isFollowing(user, "otheruser");

        assertFalse(isFollowing);
    }
} 