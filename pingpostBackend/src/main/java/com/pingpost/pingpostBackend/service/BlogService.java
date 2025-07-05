package com.pingpost.pingpostBackend.service;

import com.pingpost.pingpostBackend.dto.BlogRequest;
import com.pingpost.pingpostBackend.dto.BlogResponse;
import com.pingpost.pingpostBackend.dto.PaginatedResponse;
import com.pingpost.pingpostBackend.dto.AuthorDTO;
import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.User;
import com.pingpost.pingpostBackend.exception.ResourceNotFoundException;
import com.pingpost.pingpostBackend.repository.BlogRepository;
import com.pingpost.pingpostBackend.repository.UserRepository;
import com.pingpost.pingpostBackend.repository.LikeRepository;
import com.pingpost.pingpostBackend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BlogService {
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public BlogResponse publishBlog(BlogRequest request, String username) {
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Blog blog = new Blog();
        blog.setTitle(request.getTitle());
        blog.setContent(request.getContent());
        blog.setImageUrl(request.getImageUrl());
        blog.setAuthor(author);
        blog.setHashtags(extractHashtags(request.getContent()));

        Blog saved = blogRepository.save(blog);
        return toResponse(saved);
    }

    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public BlogResponse getBlogById(Long id) {
        Blog blog = blogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        return toResponse(blog);
    }

    @Transactional
    public BlogResponse updateBlog(Long id, BlogRequest request, String username) throws AccessDeniedException {
        Blog blog = blogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        if (!blog.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not the author of this blog");
        }
        blog.setTitle(request.getTitle());
        blog.setContent(request.getContent());
        blog.setImageUrl(request.getImageUrl());
        blog.setHashtags(extractHashtags(request.getContent()));
        Blog updated = blogRepository.save(blog);
        return toResponse(updated);
    }

    @Transactional
    public void deleteBlog(Long id, String username) throws AccessDeniedException {
        Blog blog = blogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        if (!blog.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You are not the author of this blog");
        }
        blogRepository.delete(blog);
    }

    public List<BlogResponse> getBlogsByUser(String username) {
        return blogRepository.findAll().stream()
            .filter(blog -> blog.getAuthor().getUsername().equals(username))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PaginatedResponse<BlogResponse> getBlogsPaginated(int page, int size) {
        Page<Blog> blogPage = blogRepository.findAll(PageRequest.of(page, size));
        PaginatedResponse<BlogResponse> response = new PaginatedResponse<>();
        response.setContent(blogPage.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        response.setTotalPages(blogPage.getTotalPages());
        response.setTotalElements(blogPage.getTotalElements());
        response.setSize(blogPage.getSize());
        response.setNumber(blogPage.getNumber());
        return response;
    }

    public List<BlogResponse> getBlogsByHashtag(String hashtag) {
        List<Blog> blogs = blogRepository.findByHashtagsIgnoreCase(hashtag);
        return blogs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<String> getHashtagSuggestions(String prefix) {
        if (prefix == null || prefix.isEmpty()) return List.of();
        return blogRepository.findDistinctHashtagsByPrefix(prefix);
    }

    private BlogResponse toResponse(Blog blog) {
        BlogResponse resp = new BlogResponse();
        resp.setId(blog.getId());
        resp.setTitle(blog.getTitle());
        resp.setContent(blog.getContent());
        resp.setImageUrl(blog.getImageUrl());
        resp.setAuthor(toAuthorDTO(blog.getAuthor()));
        resp.setCreatedAt(blog.getCreatedAt());
        resp.setUpdatedAt(blog.getUpdatedAt());
        resp.setLikeCount((int) likeRepository.countByBlog(blog));
        resp.setCommentCount((int) commentRepository.countByBlog(blog));
        return resp;
    }

    private AuthorDTO toAuthorDTO(User user) {
        AuthorDTO dto = new AuthorDTO();
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }

    private Set<String> extractHashtags(String content) {
        Set<String> hashtags = new java.util.HashSet<>();
        if (content == null) return hashtags;
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            hashtags.add(matcher.group(1).toLowerCase());
        }
        return hashtags;
    }
} 