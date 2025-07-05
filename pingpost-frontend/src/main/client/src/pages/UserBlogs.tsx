import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import { blogService } from '../services/api';
import type { Blog } from '../types';

const UserBlogs = () => {
  const { username } = useParams<{ username: string }>();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const userBlogs = await blogService.getBlogsByUser(username);
        setBlogs(userBlogs);
        setError(null);
      } catch {
        setError('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [username]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>Blogs by {username}</Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {blogs.length === 0 && !loading && !error && (
          <Typography color="text.secondary">No blogs found for this user.</Typography>
        )}
        {blogs.map((blog) => (
          <Box key={blog.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="h6" sx={{ color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}>
                {blog.title}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {new Date(blog.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {blog.content.substring(0, 150)}...
            </Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default UserBlogs; 