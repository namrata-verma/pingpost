import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Paper,
  Typography,
  IconButton,
  CardMedia,
  Chip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogService, likeService } from '../services/api';
import type { Blog, PaginatedResponse } from '../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsSection from '../components/CommentsSection';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);
  const [open, setOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', imageUrl: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [likeStates, setLikeStates] = useState<Record<number, { liked: boolean; count: number }>>({});
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; blogId: number | null }>({ open: false, blogId: null });
  const fallbackUrl = 'https://www.standardbio.com/Store/NoImageAvailable.jpeg';
  const navigate = useNavigate();

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const apiPage = page - 1;
      const response = await axios.get<PaginatedResponse<Blog>>(
        `http://localhost:8080/api/blogs?page=${apiPage}&size=${pageSize}`
      );
      setBlogs(response.data?.content ?? []);
      setTotalPages(response.data.totalPages);
      setError(null);
      // Fetch like state for each blog
      const likeStatesObj: Record<number, { liked: boolean; count: number }> = {};
      await Promise.all(
        response.data.content.map(async (blog) => {
          try {
            const [liked, count] = await Promise.all([
              likeService.isBlogLikedByUser(blog.id),
              likeService.getLikeCount(blog.id),
            ]);
            likeStatesObj[blog.id] = { liked, count };
          } catch {
            likeStatesObj[blog.id] = { liked: false, count: 0 };
          }
        })
      );
      setLikeStates(likeStatesObj);
    } catch {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleOpen = () => {
    setOpen(true);
    setNewBlog({ title: '', content: '', imageUrl: '' });
    setCreateError(null);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewBlog((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await blogService.createBlog(newBlog);
      setOpen(false);
      setNewBlog({ title: '', content: '', imageUrl: '' });
      setPage(1);
      await fetchBlogs();
    } catch {
      setCreateError('Failed to create blog.');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (blogId: number) => {
    if (!user) return;
    const current = likeStates[blogId];
    try {
      if (current.liked) {
        await likeService.unlikeBlog(blogId);
        setLikeStates((prev) => ({
          ...prev,
          [blogId]: { liked: false, count: Math.max(0, prev[blogId].count - 1) },
        }));
      } else {
        await likeService.likeBlog(blogId);
        setLikeStates((prev) => ({
          ...prev,
          [blogId]: { liked: true, count: prev[blogId].count + 1 },
        }));
      }
    } catch {
      // Optionally show error
    }
  };

  const handleOpenComments = (blogId: number) => {
    setCommentDialog({ open: true, blogId });
  };
  const handleCloseComments = () => {
    setCommentDialog({ open: false, blogId: null });
  };

  const extractHashtags = (text: string): string[] => {
    if (!text) return [];
    const matches = text.match(/#(\w+)/g);
    return matches ? Array.from(new Set(matches.map(tag => tag.slice(1).toLowerCase()))) : [];
  };
  const hashtags = extractHashtags(newBlog.content);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpen} fullWidth={true} sx={{ mb: { xs: 1, sm: 0 } }}>
          Create New Post
        </Button>
        <Button variant="outlined" color="secondary" onClick={logout} fullWidth={true} sx={{ ml: { sm: 2 }, mb: { xs: 1, sm: 0 } }}>
          Logout
        </Button>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {blogs.length === 0 ? (
            <Box>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No blogs found.
              </Typography>
            </Box>
          ) : (
            blogs
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 20)
              .map((blog) => (
                <Box key={blog.id} sx={{ width: '100%' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      height: { xs: 'auto', md: 200 },
                      maxHeight: { xs: 'none', md: 200 },
                      minHeight: { xs: 'none', md: 200 },
                      p: 0,
                      overflow: 'hidden',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', minHeight: 0, width: { xs: '100%', md: '60%' } }}>
                      <MuiLink
                        component={Link}
                        to={`/blogs/${blog.id}`}
                        variant="h6"
                        underline="hover"
                        sx={{ 
                          fontWeight: 700, 
                          color: '#222', 
                          mb: 1, 
                          display: 'block', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '1.1rem'
                        }}
                      >
                        {blog.title}
                      </MuiLink>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.6em',
                          maxHeight: '3.6em',
                          fontSize: '0.9rem'
                        }}
                      >
                        {blog.content}
                      </Typography>
                      {Array.isArray(blog.hashtags) && blog.hashtags.length > 0 && (
                        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {blog.hashtags.map((tag) => (
                            <Chip
                              key={tag}
                              label={`#${tag}`}
                              color="secondary"
                              size="small"
                              onClick={() => navigate(`/search/hashtag/${tag}`)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 'auto' }}>
                        <Link to={`/users/${blog.author.username}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                          <Avatar
                            src={blog.author.profilePicture}
                            alt={blog.author.username}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {blog.author.fullName || blog.author.username}
                          </Typography>
                        </Link>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.75rem' }}>
                          {blog.updatedAt !== blog.createdAt
                            ? `Updated at: ${new Date(blog.updatedAt).toLocaleString()}`
                            : `Created at: ${new Date(blog.createdAt).toLocaleString()}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color={likeStates[blog.id]?.liked ? 'error' : 'default'}
                            onClick={() => handleLike(blog.id)}
                            disabled={!user}
                            sx={{ padding: '4px' }}
                          >
                            {likeStates[blog.id]?.liked ? <FavoriteIcon sx={{ fontSize: '1rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />}
                          </IconButton>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{likeStates[blog.id]?.count ?? 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenComments(blog.id)} sx={{ padding: '4px' }}>
                            <CommentIcon color="primary" sx={{ fontSize: '1rem' }} />
                          </IconButton>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{blog.commentCount ?? 0}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <CardMedia
                      component="img"
                      sx={{
                        width: { xs: '100%', md: '40%' },
                        height: { xs: 180, md: '100%' },
                        objectFit: 'cover',
                        borderTopRightRadius: { md: 12 },
                        borderBottomRightRadius: { md: 12 },
                        borderTopLeftRadius: { xs: 0, md: 0 },
                        borderBottomLeftRadius: { xs: 0, md: 0 },
                      }}
                      image={blog.imageUrl || fallbackUrl}
                      alt={blog.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackUrl;
                      }}
                    />
                  </Paper>
                </Box>
              ))
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
      <Dialog open={commentDialog.open} onClose={handleCloseComments} maxWidth="sm" fullWidth>
        <DialogContent>
          {commentDialog.blogId && <CommentsSection blogId={commentDialog.blogId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComments}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            value={newBlog.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            name="content"
            fullWidth
            multiline
            rows={6}
            value={newBlog.content}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Image URL"
            name="imageUrl"
            fullWidth
            value={newBlog.imageUrl}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          {hashtags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hashtags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} color="primary" size="small" />
              ))}
            </Box>
          )}
          {createError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {createError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={creating}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={creating || !newBlog.title || !newBlog.content}>
            {creating ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 