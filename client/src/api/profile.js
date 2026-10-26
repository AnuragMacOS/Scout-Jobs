import api from './axios';

export async function getProfile() {
  const response = await api.get('/profile');
  return response.data;
}

export async function updatePersonal(data) {
  const response = await api.put('/profile/personal', data);
  return response.data;
}

export async function updateAcademic(data) {
  const response = await api.put('/profile/academic', data);
  return response.data;
}

export async function changePassword(data) {
  const response = await api.put('/profile/password', data);
  return response.data;
}
