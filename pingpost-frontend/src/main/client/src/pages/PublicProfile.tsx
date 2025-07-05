import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../context/AuthContext';
import { userService, blogService } from '../services/api';
import type { PublicUserProfileDTO, BlogResponse } from '../types';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsSection from '../components/CommentsSection';
import MuiLink from '@mui/material/Link';
import Chip from '@mui/material/Chip';

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfileDTO | null>(null);
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openList, setOpenList] = useState<'followers' | 'following' | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [userList, setUserList] = useState<PublicUserProfileDTO[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; blogId: number | null }>({ open: false, blogId: null });
  const fallbackUrl = 'https://www.standardbio.com/Store/NoImageAvailable.jpeg';

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    Promise.all([
      userService.getFollowersCount(username),
      userService.getFollowingCount(username),
      userService.getPublicProfile(username),
      blogService.getBlogsByUser(username),
    ])
      .then(async ([followersCount, followingCount, userProfile, userBlogs]) => {
        setFollowers(followersCount);
        setFollowing(followingCount);
        setProfile(userProfile);
        setBlogs(userBlogs);
        if (currentUser && currentUser.username !== username) {
          const following = await userService.isFollowing(username);
          setIsFollowing(following);
        } else {
          setIsFollowing(false);
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile.username);
      } else {
        await userService.followUser(profile.username);
      }
      // Always refresh from backend
      const [followersCount, followingStatus] = await Promise.all([
        userService.getFollowersCount(profile.username),
        userService.isFollowing(profile.username),
      ]);
      setFollowers(followersCount);
      setIsFollowing(followingStatus);
    } catch {
      setError('Failed to update follow status');
    }
    setFollowLoading(false);
  };

  const handleOpenList = async (type: 'followers' | 'following') => {
    if (!username) return;
    setOpenList(type);
    setListLoading(true);
    setListError(null);
    try {
      const data = type === 'followers'
        ? await userService.getFollowers(username)
        : await userService.getFollowing(username);
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

  const handleCloseComments = () => {
    setCommentDialog({ open: false, blogId: null });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>{error || 'User not found'}</Typography>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === profile.username;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            src={profile.profilePicture || 'https://source.unsplash.com/random/200x200?portrait'}
            sx={{ width: 100, height: 100 }}
          />
          <Box>
            <Typography variant="h4" gutterBottom>{profile.fullName || profile.username}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>@{profile.username}</Typography>
            <Typography variant="body1" paragraph>{profile.bio || 'No bio provided.'}</Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mt: 1 }}>
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
              {!isOwnProfile && currentUser && (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  color="primary"
                  onClick={handleFollow}
                  disabled={followLoading}
                  sx={{ ml: 2 }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Typography variant="h5" sx={{ mb: 2 }}>Blogs by {profile.fullName || profile.username}</Typography>
      <Box>
        {blogs.length === 0 ? (
          <Typography color="text.secondary" sx={{ ml: 2 }}>No blogs found.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {blogs
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
                          fontSize: '1.1rem',
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
                          fontSize: '0.9rem',
                        }}
                      >
                        {blog.content}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {blog.hashtags && blog.hashtags.map((tag) => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            color="primary"
                            component={Link}
                            to={`/search/hashtag/${tag}`}
                            clickable
                            sx={{ fontWeight: 500, fontSize: '0.8rem' }}
                          />
                        ))}
                      </Box>
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
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{blog.likeCount ?? 0}</Typography>
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
              ))}
          </Box>
        )}
      </Box>
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
      <Dialog open={commentDialog.open} onClose={handleCloseComments} maxWidth="md" fullWidth>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {commentDialog.blogId && (
            <CommentsSection blogId={commentDialog.blogId} />
          )}
        </DialogContent>
        <Button onClick={handleCloseComments}>Close</Button>
      </Dialog>
    </Container>
  );
};

export default PublicProfile;