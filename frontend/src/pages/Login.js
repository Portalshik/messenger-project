import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              fontWeight: 500,
            }}
          >
            Вход в систему
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            autoFocus
            size={isMobile ? "small" : "medium"}
          />

          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size={isMobile ? "small" : "medium"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size={isMobile ? "medium" : "large"}
            sx={{ mt: 1 }}
          >
            Войти
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?
            </Typography>
            <Link component={RouterLink} to="/register" underline="hover">
              Зарегистрироваться
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login; 