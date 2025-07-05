import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Avatar,
  Divider,
  Paper,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Comment } from '../types';
import { Link } from 'react-router-dom';

interface CommentsSectionProps {
  blogId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ blogId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getComments(blogId);
      setComments(data);
    } catch {
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [blogId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await commentService.addComment(blogId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    setDeleteLoading(commentId);
    try {
      await commentService.deleteComment(blogId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError('Failed to delete comment');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleEditClick = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleEditSave = async (commentId: number) => {
    setEditLoading(true);
    try {
      await commentService.updateComment(blogId, commentId, editContent);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, content: editContent } : c));
      setEditingCommentId(null);
      setEditContent('');
    } catch {
      setError('Failed to update comment.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
        Comments
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Comment Input */}
      {user && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            backgroundColor: '#fafafa'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar
              src={user.profilePicture}
              alt={user.username}
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ flex: 1 }}>
              <TextField
                placeholder="Write a comment..."
                variant="outlined"
                fullWidth
                multiline
                maxRows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      '& > fieldset': { borderColor: '#1976d2' },
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleAddComment}
                        disabled={submitting || !newComment.trim()}
                        sx={{ ml: 1 }}
                      >
                        {submitting ? <CircularProgress size={24} /> : <SendIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Comments List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80px">
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {comments.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          {comments.map((comment, index) => {
            const canDelete = user && user.username && comment.authorUsername && 
              comment.authorUsername.toLowerCase() === user.username.toLowerCase();
            const canEdit = canDelete;
            
            return (
              <React.Fragment key={comment.id}>
                {index > 0 && <Divider variant="inset" component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{ px: 0 }}
                  secondaryAction={
                    editingCommentId === comment.id ? null : (
                      <>
                        {canEdit && (
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditClick(comment.id, comment.content)}
                            size="small"
                            sx={{ color: 'primary.main', mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {canDelete && (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteLoading === comment.id}
                            size="small"
                            sx={{ color: 'error.main' }}
                          >
                            {deleteLoading === comment.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        )}
                      </>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          component={Link}
                          to={`/users/${comment.authorUsername}`}
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}
                        >
                          {comment.authorUsername || 'User'}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      editingCommentId === comment.id ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            size="small"
                            multiline
                            minRows={1}
                            maxRows={4}
                            fullWidth
                            disabled={editLoading}
                          />
                          <Button
                            onClick={() => handleEditSave(comment.id)}
                            color="primary"
                            size="small"
                            disabled={editLoading || !editContent.trim()}
                            sx={{ minWidth: 0, px: 1 }}
                          >
                            {editLoading ? <CircularProgress size={18} /> : 'Save'}
                          </Button>
                          <Button
                            onClick={handleEditCancel}
                            color="inherit"
                            size="small"
                            disabled={editLoading}
                            sx={{ minWidth: 0, px: 1 }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {comment.content}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default CommentsSection; 