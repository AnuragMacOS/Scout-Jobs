import api from './axios';

export async function uploadResume(file, slotNumber) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('slotNumber', slotNumber);

  const response = await api.post('/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getResumes() {
  const response = await api.get('/resumes');
  return response.data;
}

export async function deleteResume(id) {
  const response = await api.delete(`/resumes/${id}`);
  return response.data;
}

export function getResumeDownloadUrl(id) {
  return `/api/resumes/${id}/download`;
}
