import api from './axios';

export async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}

export async function signup(userData) {
  const response = await api.post('/auth/signup', userData);
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function verifyResetToken(token) {
  const response = await api.get('/auth/verify-reset-token', {
    params: { token },
  });
  return response.data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
}

export async function googleLogin(payload) {
  const response = await api.post('/auth/google', payload);
  return response.data;
}
