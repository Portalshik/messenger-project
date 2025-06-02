import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { api, API_URL } from '../contexts/AuthContext';

function MediaGallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await api.get('/api/media');
      setMedia(response.data);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке медиафайлов');
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  const filteredMedia = media.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск медиафайлов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size={isMobile ? "small" : "medium"}
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {filteredMedia.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                <CardMedia
                  component="img"
                  image={API_URL + item.path}
                  alt={item.filename}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  onClick={() => handleImageClick(item)}
                >
                  <ZoomInIcon />
                </IconButton>
              </Box>
              <CardContent>
                <Typography variant="body2" noWrap>
                  {item.filename}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedImage}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={API_URL + selectedImage.path}
              alt={selectedImage.filename}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default MediaGallery; 