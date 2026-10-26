import api from './axios';

export async function searchExternalJobs(params = {}) {
  const response = await api.get('/external-jobs', { params });
  return response.data;
}
