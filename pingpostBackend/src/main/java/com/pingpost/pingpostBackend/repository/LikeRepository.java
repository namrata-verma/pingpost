package com.pingpost.pingpostBackend.repository;

import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.Like;
import com.pingpost.pingpostBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserAndBlog(User user, Blog blog);
    void deleteByUserAndBlog(User user, Blog blog);
    long countByBlog(Blog blog);
    List<Like> findByUser(User user);
} 