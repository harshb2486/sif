// API Service
// Centralized axios configuration and API calls

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on main auth API endpoints - NOT for chat
    if (error.response?.status === 401 && 
        !error.config.url.includes('/chat/') && 
        !error.config.url.includes('/chat')) {
      // Unauthorized - clear token and redirect to login only for non-chat endpoints
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  registerCompany: (data) => api.post('/auth/register/company', data),
  registerSalesPerson: (data) => api.post('/auth/register/sales', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, confirmPassword) =>
    api.post(`/auth/reset-password/${token}`, { password, confirmPassword }),
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    api.put('/auth/change-password', { oldPassword, newPassword, confirmPassword })
};

// COMPANIES API
export const companiesAPI = {
  getDetails: (id) => api.get(`/companies/${id}`),
  getSalesPersons: (status = 'pending', search = '', page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return api.get(`/companies/sales-persons?${params.toString()}`);
  },
  approveSalesPerson: (id) => api.put(`/companies/sales/${id}/approve`)
};

// USERS API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getCompanyMembers: (page = 1, limit = 10, search = '') =>
    api.get(`/users/company/members?page=${page}&limit=${limit}&search=${search}`)
};

// PRODUCTS API
export const productsAPI = {
  create: (data) => api.post('/products', data),
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getWithPagination: (page = 1, limit = 10, search = '') =>
    api.get(`/products?page=${page}&limit=${limit}&search=${search}`)
};

// SALES API
export const salesAPI = {
  getProducts: () => api.get('/sales/products'),
  createOrder: (data) => api.post('/sales/orders', data),
  getMyOrders: (page = 1, limit = 10) => api.get(`/sales/orders?page=${page}&limit=${limit}`),
  getMyCommissions: (page = 1, limit = 10) => api.get(`/sales/commissions?page=${page}&limit=${limit}`)
};

// REPORTS API
export const reportsAPI = {
  getCommissionReport: () => api.get('/reports/commission'),
  getSalesReport: () => api.get('/reports/sales'),
  getLeaderboard: (limit = 10) => api.get(`/reports/leaderboard?limit=${limit}`),
  getDashboardStats: () => api.get('/reports/dashboard')
};

// EXPORTS API
export const exportsAPI = {
  exportOrders: (startDate, endDate) => {
    let url = '/exports/orders';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    window.open(`${API_BASE_URL}${url}?_token=${localStorage.getItem('token')}`, '_blank');
  },
  exportCommissions: (startDate, endDate) => {
    let url = '/exports/commissions';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    window.open(`${API_BASE_URL}${url}?_token=${localStorage.getItem('token')}`, '_blank');
  },
  exportSalesReport: () => {
    window.open(`${API_BASE_URL}/exports/sales-report?_token=${localStorage.getItem('token')}`, '_blank');
  }
};

// CHAT API (Sales Assistant)
export const chatAPI = {
  sendMessage: (message, conversationId = null) => {
    const payload = { message };
    if (conversationId) {
      payload.conversationId = conversationId;
    }
    return api.post('/chat/message', payload);
  },
  getConversations: (limit = 20) => 
    api.get(`/chat/conversations?limit=${limit}`),
  getConversation: (conversationId) => 
    api.get(`/chat/conversations/${conversationId}`),
  deleteConversation: (conversationId) => 
    api.delete(`/chat/conversations/${conversationId}`),
  searchConversations: (query) => 
    api.get(`/chat/search?q=${encodeURIComponent(query)}`),
  getChatStatus: () => 
    api.get('/chat/status')
};

// OWNER-SALES REALTIME CHAT API
export const ownerSalesChatAPI = {
  getContacts: () => api.get('/owner-sales-chat/contacts'),
  getConversations: () => api.get('/owner-sales-chat/conversations'),
  getMessagesByContact: (contactUserId, limit = 100) =>
    api.get(`/owner-sales-chat/conversations/${contactUserId}/messages?limit=${limit}`),
  sendMessage: (contactUserId, content) =>
    api.post('/owner-sales-chat/messages', { contactUserId, content })
};

export default api;
