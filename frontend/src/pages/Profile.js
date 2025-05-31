import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  TextField,
  Grid,
  Divider,
  IconButton,
  Fade,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  Image as ImageIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalChats: 0,
    totalMedia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
    loadUserData();
    loadStats();
  }, [user]);

  const loadUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setEditedUser(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке данных профиля');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/user/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
    setSelectedFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editedUser.username);
      formData.append('email', editedUser.email);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await axios.put('/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(response.data);
      setIsEditing(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      setSuccess('Профиль успешно обновлен');
    } catch (error) {
      setError('Ошибка при обновлении профиля');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true}>
            <Box>
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'rgba(30, 30, 30, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview || editedUser?.avatar_url}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid',
                    borderColor: 'primary.main',
                  }}
                />
                {isEditing && (
                  <IconButton
                    component="label"
              sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
              }}
            >
              <input
                      type="file"
                      hidden
                accept="image/*"
                      onChange={handleFileChange}
              />
                    <PhotoCameraIcon />
                </IconButton>
                )}
              </Box>
              <Box sx={{ ml: 4 }}>
                <Typography variant="h4" gutterBottom>
                  {editedUser?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  {editedUser?.email}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                {isEditing ? (
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="error" onClick={handleCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <IconButton color="primary" onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
              )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Имя пользователя"
                  value={editedUser?.username || ''}
                onChange={(e) =>
                    setEditedUser({ ...editedUser, username: e.target.value })
                }
                disabled={!isEditing}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                  value={editedUser?.email || ''}
                onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                }
                disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
              Статистика
            </Typography>
            <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        background: 'linear-gradient(45deg, #7C4DFF 30%, #B47CFF 90%)',
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                          }}
                        >
                          <MessageIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4">{stats.totalMessages}</Typography>
                          <Typography variant="body2">Сообщений</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        background: 'linear-gradient(45deg, #FF4081 30%, #FF79B0 90%)',
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                          }}
                        >
                          <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4">{stats.totalChats}</Typography>
                          <Typography variant="body2">Чатов</Typography>
                        </Box>
                      </CardContent>
                    </Card>
              </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        background: 'linear-gradient(45deg, #00BFA5 30%, #1DE9B6 90%)',
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h4">{stats.totalMedia}</Typography>
                          <Typography variant="body2">Медиафайлов</Typography>
                        </Box>
                      </CardContent>
                    </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
      </Fade>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile; 