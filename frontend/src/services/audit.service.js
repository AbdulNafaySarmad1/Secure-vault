import api from './api';

const auditService = {
  getMyLogs: (page = 1, limit = 20) => 
    api.get(`/audit/my-logs?page=${page}&limit=${limit}`),
  getAllLogs: (page = 1, limit = 50) => 
    api.get(`/audit/all?page=${page}&limit=${limit}`)
};

export default auditService;
