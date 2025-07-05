package com.pingpost.pingpostBackend.repository;

import com.pingpost.pingpostBackend.entity.Comment;
import com.pingpost.pingpostBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBlogId(Long blogId);
    List<Comment> findByAuthor(User user);
    long countByBlog(com.pingpost.pingpostBackend.entity.Blog blog);
} 