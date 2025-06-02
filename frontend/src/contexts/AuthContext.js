import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Устанавливаем базовый URL для axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Создаем экземпляр axios с настройками
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export { API_URL };

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Проверяем валидность токена
      api.get('/api/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Получаем пользователя после логина
      const userResponse = await api.get('/api/auth/me');
      setUser(userResponse.data);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, password, fullName) => {
    try {
      const response = await api.post('/api/registration', {
        username,
        password,
        full_name: fullName
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
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