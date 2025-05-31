import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Устанавливаем базовый URL для axios
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Проверяем валидность токена
      axios.get('/api/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await axios.post('/api/auth/login', { username, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    // Получаем пользователя после логина
    const userResponse = await axios.get('/api/auth/me');
    setUser(userResponse.data);

    return response.data;
  };

  const register = async (username, password, confirmPassword, email) => {
    try {
      const response = await axios.post('/api/registration', {
        username,
        password,
        confirm_password: confirmPassword,
        email
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 