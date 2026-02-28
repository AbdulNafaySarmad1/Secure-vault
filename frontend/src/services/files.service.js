import api from './api';

const filesService = {
  getAll: () => api.get('/files'),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  download: (id) => `${process.env.REACT_APP_API_URL}/files/${id}/download`,
  delete: (id) => api.delete(`/files/${id}`)
};

export default filesService;
