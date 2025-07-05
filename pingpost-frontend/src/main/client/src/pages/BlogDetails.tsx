import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Box, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blogService } from '../services/api';
import type { Blog } from '../types';
import CommentsSection from '../components/CommentsSection';
import { useAuth } from '../context/AuthContext';

const BlogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedBlog, setEditedBlog] = useState({ title: '', content: '', imageUrl: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('Invalid blog ID');
        setLoading(false);
        return;
      }

      try {
        const data = await blogService.getBlog(Number(id));
        setBlog(data);
        setEditedBlog({
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl || ''
        });
      } catch (err: unknown) {
        setError('Failed to fetch blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditError(null);
  };

  const handleEditSubmit = async () => {
    if (!id || !blog) return;

    try {
      setEditError(null);
      setError(null);
      console.log('Updating blog with data:', editedBlog);
      
      const response = await blogService.updateBlog(Number(id), editedBlog);
      console.log('Update response:', response);
      
      if (response && response.id) {
        setBlog(response);
        setEditDialogOpen(false);
      } else {
        console.error('Invalid response structure:', response);
        setEditError('Received invalid response from server. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Error updating blog:', err);
      setEditError('Failed to update blog. Please try again.');
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setDeleteLoading(true);
    try {
      await blogService.deleteBlog(Number(id));
      navigate('/dashboard');
    } catch (err: unknown) {
      setError('Failed to delete blog');
      console.error('Error deleting blog:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const isAuthor = user && blog && user.username === blog.author.username;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Blog not found
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {blog.title}
          </Typography>
          {isAuthor && (
            <Box>
              <IconButton
                onClick={handleEditClick}
                color="primary"
                sx={{ ml: 2 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={handleDeleteClick}
                color="error"
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        {blog.imageUrl && (
          <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <img
              src={blog.imageUrl}
              alt={blog.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {blog.content}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">
            By {blog.author.fullName || blog.author.username} •
            Created: {new Date(blog.createdAt).toLocaleString()}
            {blog.updatedAt !== blog.createdAt &&
              ` • Updated: ${new Date(blog.updatedAt).toLocaleString()}`
            }
          </Typography>
        </Box>
        <CommentsSection blogId={blog.id} />
      </Paper>

      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Blog</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={editedBlog.title}
            onChange={(e) => setEditedBlog({ ...editedBlog, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={10}
            value={editedBlog.content}
            onChange={(e) => setEditedBlog({ ...editedBlog, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={editedBlog.imageUrl}
            onChange={(e) => setEditedBlog({ ...editedBlog, imageUrl: e.target.value })}
          />
          {editError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {editError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this blog post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogDetails; 