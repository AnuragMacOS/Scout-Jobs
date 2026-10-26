import api from './axios';

export async function getJobs(params = {}) {
  const response = await api.get('/jobs', { params });
  return response.data;
}

export async function getJobById(id) {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
}
