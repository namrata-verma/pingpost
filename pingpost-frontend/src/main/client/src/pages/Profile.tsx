import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { blogService, userService, likeService, commentService } from '../services/api';
import type { BlogResponse, CommentResponse, UserProfileRequest } from '../types';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Box,
  Tab,
  Tabs,
  CardMedia,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import MuiLink from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import CommentsSection from '../components/CommentsSection';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import type { Blog, PaginatedResponse } from '../types';

const Profile = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [likedBlogs, setLikedBlogs] = useState<Blog[]>([]);
  const [userComments, setUserComments] = useState<CommentResponse[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileRequest>({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [openList, setOpenList] = useState<'followers' | 'following' | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [userList, setUserList] = useState<Array<{ username: string; fullName?: string; profilePicture?: string }>>([]);
  const [listError, setListError] = useState<string | null>(null);
  const fallbackUrl = 'https://www.standardbio.com/Store/NoImageAvailable.jpeg';
  const [likeStates, setLikeStates] = useState<Record<number, { liked: boolean; count: number }>>({});
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; blogId: number | null }>({ open: false, blogId: null });
  const [editCommentDialog, setEditCommentDialog] = useState<{ open: boolean; comment: CommentResponse | null }>({ open: false, comment: null });
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentLoading, setEditCommentLoading] = useState(false);
  const [commentBlogs, setCommentBlogs] = useState<Record<number, BlogResponse>>({});
  const navigate = useNavigate();
  const [page] = useState(1);
  const [likedPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchUserBlogs = useCallback(async () => {
    if (!user) return;
    try {
      const apiPage = page - 1;
      const response = await axios.get<PaginatedResponse<Blog>>(
        `http://localhost:8080/api/blogs/user/${user.id}?page=${apiPage}&size=${pageSize}`
      );
      setBlogs(response.data?.content ?? []);
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
    } catch (error) {
      console.error('Failed to fetch user blogs:', error);
      setEditError('Failed to load your blogs. Please try again later.');
    }
  }, [user, page, pageSize]);

  const fetchLikedBlogs = useCallback(async () => {
    if (!user) return;
    try {
      const apiPage = likedPage - 1;
      const response = await axios.get<PaginatedResponse<Blog>>(
        `http://localhost:8080/api/blogs/liked?page=${apiPage}&size=${pageSize}`
      );
      setLikedBlogs(response.data?.content ?? []);
    } catch (error) {
      console.error('Failed to fetch liked blogs:', error);
      setEditError('Failed to load liked blogs. Please try again later.');
    }
  }, [user, likedPage, pageSize]);

  useEffect(() => {
    if (user) {
      fetchUserBlogs();
      fetchLikedBlogs();
    }
  }, [user, page, likedPage, fetchUserBlogs, fetchLikedBlogs]);

  useEffect(() => {
    if (tabValue === 1 && user) {
      setLikesLoading(true);
      userService.getLikedBlogs()
        .then(setLikedBlogs)
        .catch(() => setLikedBlogs([]))
        .finally(() => setLikesLoading(false));
    }
    if (tabValue === 2 && user) {
      setCommentsLoading(true);
      userService.getUserComments()
        .then(setUserComments)
        .catch(() => setUserComments([]))
        .finally(() => setCommentsLoading(false));
    }
  }, [tabValue, user]);

  useEffect(() => {
    if (!user?.username) return;
    userService.getFollowersCount(user.username).then(setFollowers);
    userService.getFollowingCount(user.username).then(setFollowing);
  }, [user]);

  useEffect(() => {
    if (blogs.length === 0) return;
    const fetchLikeStates = async () => {
      const likeStatesObj: Record<number, { liked: boolean; count: number }> = {};
      await Promise.all(
        blogs.map(async (blog) => {
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
    };
    fetchLikeStates();
  }, [blogs]);

  useEffect(() => {
    if (likedBlogs.length === 0) return;
    const fetchLikedBlogStates = async () => {
      const likeStatesObj: Record<number, { liked: boolean; count: number }> = {};
      await Promise.all(
        likedBlogs.map(async (blog) => {
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
      setLikeStates((prev) => ({ ...prev, ...likeStatesObj }));
    };
    fetchLikedBlogStates();
  }, [likedBlogs]);

  useEffect(() => {
    if (userComments.length === 0) return;
    const fetchBlogInfo = async () => {
      const blogs: Record<number, BlogResponse> = {};
      await Promise.all(
        userComments.map(async (comment) => {
          try {
            const blog = await blogService.getBlog(comment.blogId);
            blogs[comment.blogId] = blog;
          } catch (err) {
            console.error('Failed to fetch blog info:', err);
          }
        })
      );
      setCommentBlogs(blogs);
    };
    fetchBlogInfo();
  }, [userComments]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditOpen = () => {
    setEditForm({
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || '',
    });
    setEditError(null);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev: UserProfileRequest) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await userService.updateProfile(editForm);
      // Fetch the latest profile info
      if (user) {
        // Profile updated successfully
      }
      setEditOpen(false);
    } catch {
      setEditError('Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenList = async (type: 'followers' | 'following') => {
    if (!user?.username) return;
    setOpenList(type);
    setListLoading(true);
    setListError(null);
    try {
      const data = type === 'followers'
        ? await userService.getFollowers(user.username)
        : await userService.getFollowing(user.username);
      setUserList(data);
    } catch {
      setListError('Failed to load list');
      setUserList([]);
    }
    setListLoading(false);
  };

  const handleCloseList = () => {
    setOpenList(null);
    setUserList([]);
    setListError(null);
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
    } catch (error) {
      console.error('Failed to update like status:', error);
      setEditError('Failed to update like status. Please try again.');
    }
  };

  const handleOpenComments = (blogId: number) => {
    setCommentDialog({ open: true, blogId });
  };
  const handleCloseComments = () => {
    setCommentDialog({ open: false, blogId: null });
  };

  const handleEditComment = (comment: CommentResponse) => {
    setEditCommentDialog({ open: true, comment });
    setEditCommentContent(comment.content);
  };

  const handleCloseEditComment = () => {
    setEditCommentDialog({ open: false, comment: null });
    setEditCommentContent('');
  };

  const handleSaveEditComment = async () => {
    if (!editCommentDialog.comment) return;
    setEditCommentLoading(true);
    try {
      await commentService.updateComment(editCommentDialog.comment.blogId, editCommentDialog.comment.id, editCommentContent);
      // Refresh comments
      const updatedComments = await userService.getUserComments();
      setUserComments(updatedComments);
      handleCloseEditComment();
    } catch (error) {
      console.error('Failed to update comment:', error);
      setEditError('Failed to update comment. Please try again.');
    } finally {
      setEditCommentLoading(false);
    }
  };

  const handleDeleteComment = async (blogId: number, commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentService.deleteComment(blogId, commentId);
      // Refresh comments
      const updatedComments = await userService.getUserComments();
      setUserComments(updatedComments);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setEditError('Failed to delete comment. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid spacing={4}>
          <div style={{ textAlign: 'center' }}>
            <Avatar
              src={user.profilePicture || 'https://source.unsplash.com/random/200x200?portrait'}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom>
              {user.fullName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            <Typography variant="body1" paragraph>
              {user.bio || 'No bio provided.'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mb: 2 }}
              onClick={handleEditOpen}
            >
              Edit Profile
            </Button>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleOpenList('followers')}
                color="primary"
              >
                <b>{followers}</b> Followers
              </Typography>
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleOpenList('following')}
                color="primary"
              >
                <b>{following}</b> Following
              </Typography>
            </Box>
          </div>
          <div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    minWidth: { xs: 'auto', sm: 120 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 12px', sm: '12px 16px' },
                  },
                  '& .MuiTabs-scrollButtons': {
                    '&.Mui-disabled': { opacity: 0.3 },
                  },
                }}
              >
                <Tab label="My Blogs" />
                <Tab label="Liked Blogs" />
                <Tab label="My Comments" />
              </Tabs>
            </Box>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {blogs.length === 0 ? (
                    <Box>
                      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No blogs found.
                      </Typography>
                    </Box>
                  ) : (
                    [...blogs]
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
              </Box>
            )}
            {tabValue === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {likesLoading ? (
                  <Box display="flex" justifyContent="center" width="100%">
                    <CircularProgress />
                  </Box>
                ) : likedBlogs.length > 0 ? (
                  [...likedBlogs]
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No liked blogs found.
                  </Typography>
                )}
              </Box>
            )}
            {tabValue === 2 && (
              <Grid spacing={3}>
                {commentsLoading ? (
                  <Box display="flex" justifyContent="center" width="100%">
                    <CircularProgress />
                  </Box>
                ) : userComments.length > 0 ? (
                  userComments.map((comment) => (
                    <Grid key={comment.id} size={{ xs: 12 }}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          '&:hover': { boxShadow: 3 }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Link 
                            to={`/blogs/${comment.blogId}`} 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 500 }}>
                              {commentBlogs[comment.blogId]?.title || 'Loading...'}
                            </Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            by @{comment.authorUsername}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {comment.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {user?.username === comment.authorUsername && (
                            <>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditComment(comment)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteComment(comment.blogId, comment.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          <Button
                            size="small"
                            startIcon={<CommentIcon />}
                            onClick={() => navigate(`/blogs/${comment.blogId}`)}
                          >
                            View Post
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    No comments found.
                  </Typography>
                )}
              </Grid>
            )}
          </div>
        </Grid>
      </Paper>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            name="fullName"
            fullWidth
            value={editForm.fullName}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            label="Bio"
            name="bio"
            fullWidth
            multiline
            minRows={2}
            value={editForm.bio}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            label="Profile Picture URL"
            name="profilePicture"
            fullWidth
            value={editForm.profilePicture}
            onChange={handleEditChange}
          />
          {editError && <Typography color="error" sx={{ mt: 1 }}>{editError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={editLoading}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!openList} onClose={handleCloseList} fullWidth maxWidth="xs">
        <DialogTitle>{openList === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        <DialogContent>
          {listLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : listError ? (
            <Typography color="error">{listError}</Typography>
          ) : userList.length === 0 ? (
            <Typography color="text.secondary">No users found.</Typography>
          ) : (
            <List>
              {userList.map((user) => (
                <ListItem
                  key={user.username}
                  component={Link}
                  to={`/users/${user.username}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.profilePicture || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.fullName || user.username}
                    secondary={`@${user.username}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Comment Dialog */}
      <Dialog open={editCommentDialog.open} onClose={handleCloseEditComment} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditComment} disabled={editCommentLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEditComment} 
            variant="contained" 
            color="primary"
            disabled={editCommentLoading}
          >
            {editCommentLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Comment Dialog/Modal - always rendered */}
      <Dialog open={commentDialog.open} onClose={handleCloseComments} maxWidth="md" fullWidth>
        <DialogContent>
          {commentDialog.blogId && (
            <CommentsSection blogId={commentDialog.blogId} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComments}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 