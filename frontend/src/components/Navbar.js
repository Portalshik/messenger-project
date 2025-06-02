import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {isMobile && (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                },
              }}
            >
              <MenuItem onClick={() => { navigate('/'); handleClose(); }}>
                <ChatIcon sx={{ mr: 1 }} />
                Чаты
              </MenuItem>
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <PersonIcon sx={{ mr: 1 }} />
                Профиль
              </MenuItem>
              <MenuItem onClick={() => { navigate('/media'); handleClose(); }}>
                <ImageIcon sx={{ mr: 1 }} />
                Медиа
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </>
        )}

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            fontWeight: 500,
          }}
        >
          Messenger
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<ChatIcon />}
              onClick={() => navigate('/')}
            >
              Чаты
            </Button>
            <Button
              color="inherit"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/profile')}
            >
              Профиль
            </Button>
            <Button
              color="inherit"
              startIcon={<ImageIcon />}
              onClick={() => navigate('/media')}
            >
              Медиа
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </Box>
        )}

        {isMobile && (
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              display: { xs: 'block', sm: 'none' },
            }}
          >
            {user?.username}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 