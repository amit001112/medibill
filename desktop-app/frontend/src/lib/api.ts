import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/api/auth/login', credentials),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export const patientsAPI = {
  getAll: () => api.get('/api/patients'),
  create: (patient: any) => api.post('/api/patients', patient),
  update: (id: string, patient: any) => api.put(`/api/patients/${id}`, patient),
  delete: (id: string) => api.delete(`/api/patients/${id}`),
};

export const servicesAPI = {
  getAll: () => api.get('/api/services'),
  create: (service: any) => api.post('/api/services', service),
  update: (id: string, service: any) => api.put(`/api/services/${id}`, service),
  delete: (id: string) => api.delete(`/api/services/${id}`),
};

export const invoicesAPI = {
  getAll: () => api.get('/api/invoices'),
  create: (invoice: any) => api.post('/api/invoices', invoice),
  updateStatus: (id: string, status: string) =>
    api.put(`/api/invoices/${id}/status`, { status }),
};

export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (settings: any) => api.put('/api/settings', settings),
};

export default api;