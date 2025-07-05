import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import axios from 'axios';
import pingpostLogo from '../assets/pingpost-logo.jpg';

const settings = [
  { title: 'Profile', path: '/profile' },
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Logout', action: 'logout' },
];

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: number; username: string; fullName?: string; profilePicture?: string }>>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserMenuClick = (setting: { title: string; path?: string; action?: string }) => {
    handleCloseUserMenu();
    if (setting.action === 'logout') {
      logout();
      navigate('/');
    } else if (setting.path) {
      navigate(setting.path);
    }
  };

  // Live user search
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setSearchOpen(false);
      setHashtagSuggestions([]);
      setSearchOpen(false);
      return;
    }
    setAnchorEl(e.currentTarget);
    setSearchOpen(true);
    // Fetch both users and hashtags in parallel
    try {
      const [userResults, hashtagResults] = await Promise.all([
        userService.searchUsers(value),
        value.length > 1 ? axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/blogs/hashtags?q=${encodeURIComponent(value.startsWith('#') ? value.slice(1) : value)}`) : Promise.resolve({ data: [] })
      ]);
      setSearchResults(userResults);
      setHashtagSuggestions((hashtagResults.data as string[]) || []);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
      setHashtagSuggestions([]);
      setSearchOpen(false);
    }
  };

  const handleSelectUser = (username: string) => {
    setSearch('');
    setSearchResults([]);
    setSearchOpen(false);
    navigate(`/users/${username}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const handleClickAway = () => {
    setSearchOpen(false);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <Box
            component={RouterLink}
            to="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              textDecoration: 'none',
            }}
          >
            <img 
              src={pingpostLogo} 
              alt="PINGPOST" 
              style={{ 
                height: '40px', 
                width: 'auto',
                borderRadius: '4px'
              }} 
            />
          </Box>

          {/* Logo for mobile screens */}
          <Box
            component={RouterLink}
            to="/dashboard"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              textDecoration: 'none',
            }}
          >
            <img 
              src={pingpostLogo} 
              alt="PINGPOST" 
              style={{ 
                height: '32px', 
                width: 'auto',
                borderRadius: '4px'
              }} 
            />
          </Box>

          {/* User Search Bar */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: { xs: '100%', sm: 350 }, mx: 'auto', px: { xs: 1, sm: 0 } }}>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box sx={{ width: '100%', position: 'relative' }}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    boxShadow: 0,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                  onSubmit={e => e.preventDefault()}
                >
                  <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />
                  <InputBase
                    placeholder="Search Users or Hashtags..."
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    sx={{ ml: 1, flex: 1, color: '#fff', '::placeholder': { color: '#fff', opacity: 0.8 } }}
                    inputProps={{ 'aria-label': 'search users', style: { color: '#fff' } }}
                  />
                </Paper>
                <Popper
                  open={searchOpen && (searchResults.length > 0 || hashtagSuggestions.length > 0)}
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  style={{
                    zIndex: 1301,
                    width: anchorEl ? anchorEl.clientWidth : undefined,
                  }}
                >
                  <Paper
                    sx={{
                      mt: 1,
                      maxHeight: 300,
                      overflow: 'auto',
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    {/* User results */}
                    {searchResults.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100', fontWeight: 600 }}>
                          Users
                        </Typography>
                        {searchResults.map((user) => (
                          <MenuItem
                            key={user.id}
                            onClick={() => handleSelectUser(user.username)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Avatar src={user.profilePicture} sx={{ width: 32, height: 32 }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{user.username}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Box>
                    )}
                    {/* Hashtag results */}
                    {hashtagSuggestions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'grey.100', fontWeight: 600 }}>
                          Hashtags
                        </Typography>
                        {hashtagSuggestions.map((hashtag) => (
                          <MenuItem
                            key={hashtag}
                            onClick={() => {
                              setSearch('');
                              setSearchOpen(false);
                              navigate(`/search/hashtag/${hashtag}`);
                            }}
                          >
                            <Chip label={`#${hashtag}`} size="small" color="primary" />
                          </MenuItem>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>
          </Box>

          {/* User avatar and menu */}
          <Box sx={{ flexGrow: 0, ml: { xs: 1, md: 2 } }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.fullName || 'User'} src={user?.profilePicture} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar-user"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting.title} onClick={() => handleUserMenuClick(setting)}>
                  <Typography textAlign="center">{setting.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 