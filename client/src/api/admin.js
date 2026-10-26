import api from './axios';

export async function postJob(jobData) {
  const response = await api.post('/jobs', jobData);
  return response.data;
}

export async function updateJob(id, jobData) {
  const response = await api.patch(`/jobs/${id}`, jobData);
  return response.data;
}

export async function deleteJob(id) {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
}

export async function getAdminPostings() {
  const response = await api.get('/jobs/admin/postings');
  return response.data;
}
