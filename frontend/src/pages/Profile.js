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
  useTheme,
  useMediaQuery,
  Button,
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
import { api, API_URL } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

function Profile({ user: propUser }) {
  const { user: currentUser, updateUser } = useAuth();
  const user = propUser || currentUser;
  const isOwnProfile = !propUser;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
    loadUserData();
    if (isOwnProfile) {
      loadStats();
    }
  }, [user, isOwnProfile]);

  const loadUserData = async () => {
    try {
      const response = await api.get(isOwnProfile ? '/api/user/profile' : `/api/user/${user.id}`);
      setEditedUser(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке данных профиля');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/user/stats');
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Размер файла не должен превышать 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, загрузите изображение');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editedUser.username);
      formData.append('full_name', editedUser.full_name);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await api.put('/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEditedUser(response.data);
      setIsEditing(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      setSuccess('Профиль успешно обновлен');
      if (updateUser) {
        updateUser(response.data);
      }
    } catch (error) {
      setError('Ошибка при обновлении профиля');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
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
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              background: '#fff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarPreview || (editedUser?.avatar ? `${API_URL}${editedUser.avatar}` : null)}
                  sx={{
                    width: { xs: 80, sm: 120 },
                    height: { xs: 80, sm: 120 },
                    border: '4px solid',
                    borderColor: 'primary.main',
                    cursor: isEditing && isOwnProfile ? 'pointer' : 'default',
                  }}
                />
                {isEditing && isOwnProfile && (
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
              <Box sx={{ ml: { xs: 2, sm: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {editedUser?.username || 'Пользователь'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  {editedUser?.email || 'Нет email'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {isOwnProfile && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageIcon color="primary" />
                        <Typography variant="h6">{stats.totalMessages}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Всего сообщений
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" />
                        <Typography variant="h6">{stats.totalChats}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Всего чатов
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon color="primary" />
                        <Typography variant="h6">{stats.totalMedia}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Всего медиафайлов
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {isOwnProfile && (
              <Box sx={{ mt: 4 }}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Имя пользователя"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Полное имя"
                      value={editedUser.full_name}
                      onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                      fullWidth
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body1">
                      <strong>Полное имя:</strong> {editedUser.full_name}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {isOwnProfile && (
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Сохранить
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Редактировать
                  </Button>
                )}
              </Box>
            )}
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