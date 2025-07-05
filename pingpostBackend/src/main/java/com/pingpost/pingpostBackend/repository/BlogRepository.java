package com.pingpost.pingpostBackend.repository;

import com.pingpost.pingpostBackend.entity.Blog;
import com.pingpost.pingpostBackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    Page<Blog> findByAuthor(User author, Pageable pageable);
    Page<Blog> findByAuthorIn(Iterable<User> authors, Pageable pageable);
    List<Blog> findByHashtagsIgnoreCase(String hashtag);

    // Custom query to find distinct hashtags by prefix
    @Query("SELECT DISTINCT LOWER(h) FROM Blog b JOIN b.hashtags h WHERE LOWER(h) LIKE CONCAT(LOWER(:prefix), '%')")
    java.util.List<String> findDistinctHashtagsByPrefix(String prefix);
} 