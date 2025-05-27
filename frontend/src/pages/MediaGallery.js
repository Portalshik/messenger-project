import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CreateNewFolder as CreateAlbumIcon,
} from '@mui/icons-material';
import axios from 'axios';

function MediaGallery() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [openNewAlbum, setOpenNewAlbum] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await axios.get('/api/media/albums');
      setAlbums(response.data);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const loadAlbumMedia = async (albumId) => {
    try {
      const response = await axios.get(`/api/media/album/${albumId}`);
      setMedia(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleCreateAlbum = async () => {
    try {
      const response = await axios.post('/api/media/albums');
      setAlbums((prev) => [...prev, response.data]);
      setOpenNewAlbum(false);
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAlbum) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(
        `/api/media/upload/${selectedAlbum.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      loadAlbumMedia(selectedAlbum.id);
      setOpenUpload(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      await axios.delete(`/api/media/media/${mediaId}`);
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Медиа-галерея</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<CreateAlbumIcon />}
            onClick={() => setOpenNewAlbum(true)}
            sx={{ mr: 2 }}
          >
            Новый альбом
          </Button>
          {selectedAlbum && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenUpload(true)}
            >
              Загрузить файл
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Список альбомов */}
        <Grid item xs={12} md={3}>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Альбомы
            </Typography>
            {albums.map((album) => (
              <Button
                key={album.id}
                fullWidth
                variant={selectedAlbum?.id === album.id ? 'contained' : 'text'}
                onClick={() => {
                  setSelectedAlbum(album);
                  loadAlbumMedia(album.id);
                }}
                sx={{ mb: 1, justifyContent: 'flex-start' }}
              >
                Альбом {album.id}
              </Button>
            ))}
          </Box>
        </Grid>

        {/* Сетка медиа-файлов */}
        <Grid item xs={12} md={9}>
          {selectedAlbum ? (
            <Grid container spacing={2}>
              {media.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.path}
                      alt={item.filename}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {item.filename}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteMedia(item.id)}
                        sx={{ float: 'right' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 400,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Выберите альбом для просмотра
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Диалог создания нового альбома */}
      <Dialog open={openNewAlbum} onClose={() => setOpenNewAlbum(false)}>
        <DialogTitle>Создать новый альбом</DialogTitle>
        <DialogContent>
          <Typography>
            Новый альбом будет создан автоматически.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewAlbum(false)}>Отмена</Button>
          <Button onClick={handleCreateAlbum} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог загрузки файла */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Загрузить файл</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={handleFileSelect}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Отмена</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile}
          >
            Загрузить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MediaGallery; 