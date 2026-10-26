import api from './axios';

export async function applyToJob(data) {
  const response = await api.post('/applications', data);
  return response.data;
}

export async function getMyApplications() {
  const response = await api.get('/applications/mine');
  return response.data;
}

export async function getJobApplicants(jobId) {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
}

export async function updateApplicationStatus(applicationId, status) {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
}

export async function withdrawApplication(applicationId) {
  const response = await api.patch(`/applications/${applicationId}/withdraw`);
  return response.data;
}
