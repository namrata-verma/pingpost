import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import BlogDetails from './pages/BlogDetails';
import PublicProfile from './pages/PublicProfile';
import HashtagResults from './pages/HashtagResults';
import './Main.css';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Landing page component
const LandingPage = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '2rem',
    background: '#f5f7fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white'
  }}>
    <img 
      src="/src/assets/pingpost-logo.jpg"
      alt="PingPost Logo"
      className="animated-logo"
      style={{ width: '200px', marginBottom: '2rem' }} 
    />
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#1976d2' }}>Welcome to PingPost</h1>
    <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#1976d2' }}>Share your thoughts with the world</p>
  </div>
);

// Main App component
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes - redirect to dashboard if already logged in */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />

          {/* Protected routes - redirect to login if not authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/users/:username" element={<PublicProfile />} />
          <Route path="/search/hashtag/:tag" element={<HashtagResults />} />

          {/* Catch all route - redirect to dashboard if logged in, otherwise to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 