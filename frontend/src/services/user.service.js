import api from './api';

const userService = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data)
};

export default userService;
