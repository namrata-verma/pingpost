import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Avatar, IconButton, Chip, CardMedia, CircularProgress, Button } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import type { Blog, PaginatedResponse } from '../types';
import { likeService } from '../services/api';

const HashtagResults = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [pageSize] = useState(20);
  const [likeStates, setLikeStates] = useState<Record<number, { liked: boolean; count: number }>>({});
  const fallbackUrl = 'https://www.standardbio.com/Store/NoImageAvailable.jpeg';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!hashtag) return;
      try {
        setLoading(true);
        const apiPage = page - 1;
        const response = await axios.get<PaginatedResponse<Blog>>(
          `http://localhost:8080/api/blogs/search?hashtag=${encodeURIComponent(hashtag)}&page=${apiPage}&size=${pageSize}`
        );
        setBlogs(response.data?.content ?? []);
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
    };

    fetchBlogs();
  }, [hashtag, page, pageSize]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Typography color="error" align="center">{error}</Typography></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Blogs with <Chip label={`#${hashtag}`} color="primary" size="small" />
      </Typography>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {blogs.length === 0 ? (
            <Box>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No blogs found for this hashtag.
              </Typography>
            </Box>
          ) : (
            blogs.map((blog) => (
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
                    <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.1rem' }}>
                        {blog.title}
                      </Typography>
                    </Link>
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
                        {blog.hashtags.map((t) => (
                          <Chip
                            key={t}
                            label={`#${t}`}
                            color={t === hashtag ? 'primary' : 'secondary'}
                            size="small"
                            onClick={() => navigate(`/search/hashtag/${t}`)}
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
                        <IconButton size="small" color="default" sx={{ padding: '4px' }}>
                          <FavoriteBorderIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{likeStates[blog.id]?.count ?? 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" sx={{ padding: '4px' }}>
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
                  />
                </Paper>
              </Box>
            ))
          )}
        </Box>
      </Box>
      <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate(-1)}>Back</Button>
    </Container>
  );
};

export default HashtagResults; 