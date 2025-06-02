import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { API_URL } from '../contexts/AuthContext';

const Message = ({ message, isOwn }) => {
  const handleImageClick = (imgPath) => {
    if (imgPath) {
      window.open(`${API_URL}${imgPath}`, '_blank');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        px: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1, sm: 2 },
          maxWidth: { xs: '85%', sm: '70%' },
          backgroundColor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          position: 'relative',
          '&:hover': {
            '& .zoom-button': {
              opacity: 1,
            },
          },
        }}
      >
        {Array.isArray(message.media_paths) && message.media_paths.length > 0 && (
          <Box
            sx={{
              mb: 1,
              borderRadius: 2,
              overflow: 'hidden',
              maxWidth: '100%',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              '& img': {
                maxWidth: 120,
                maxHeight: 120,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              },
            }}
          >
            {message.media_paths.map((imgPath, idx) => (
              <Box key={idx} sx={{ position: 'relative' }}>
                <img
                  src={`${API_URL}${imgPath}`}
                  alt={`Медиа ${idx + 1}`}
                  onClick={() => handleImageClick(imgPath)}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <Tooltip title="Увеличить">
                  <IconButton
                    className="zoom-button"
                    size="small"
                    onClick={() => handleImageClick(imgPath)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
        <Typography
          variant="body1"
          sx={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: isOwn ? 'primary.contrastText' : 'text.secondary',
            opacity: 0.7,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
          }}
        >
          {new Date(message.sended_at).toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message; 