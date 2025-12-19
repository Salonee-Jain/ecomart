import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('userInfo');
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
