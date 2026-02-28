import api from './api';

const notesService = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/notes?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`)
};

export default notesService;
