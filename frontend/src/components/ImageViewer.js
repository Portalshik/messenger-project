import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ImageViewer = ({ imageUrl, onClose }) => {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          m: { xs: 1, sm: 2 },
          height: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            '& img': {
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            },
          }}
        >
          <img src={imageUrl} alt="Просмотр изображения" />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer; 