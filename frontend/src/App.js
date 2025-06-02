import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, useMediaQuery } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import MediaGallery from './pages/MediaGallery';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Создаем современную тему
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: { xs: 56, sm: 64 },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: { xs: 56, sm: 64 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}>
          {user && <Navbar />}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/" /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/" /> : <Register />}
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/media"
                element={
                  <ProtectedRoute>
                    <MediaGallery />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 