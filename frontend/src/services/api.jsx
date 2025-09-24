import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData),
  getAllUsers: (params) => API.get('/auth/users', { params }),
};

// Dashboard API functions
export const dashboardAPI = {
  getStats: (role) => API.get(`/dashboard/stats/${role}`),
  getRecentActivities: () => API.get('/dashboard/activities'),
  getNotifications: () => API.get('/dashboard/notifications'),
};

// Alumni API functions
export const alumniAPI = {
  getAlumniList: (params) => API.get('/alumni', { params }),
  getAlumniProfile: (id) => API.get(`/alumni/${id}`),
  updateAlumniProfile: (id, data) => API.put(`/alumni/${id}`, data),
  searchAlumni: (query) => API.get(`/alumni/search?q=${query}`),
};

// Events API functions
export const eventsAPI = {
  getAllEvents: (params) => API.get('/events', { params }),
  getEvent: (id) => API.get(`/events/${id}`),
  createEvent: (eventData) => API.post('/events', eventData),
  updateEvent: (id, eventData) => API.put(`/events/${id}`, eventData),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  joinEvent: (id) => API.post(`/events/${id}/join`),
  leaveEvent: (id) => API.post(`/events/${id}/leave`),
};

// Jobs API functions
export const jobsAPI = {
  getAllJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (jobData) => API.post('/jobs', jobData),
  updateJob: (id, jobData) => API.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  applyJob: (id, applicationData) => API.post(`/jobs/${id}/apply`, applicationData),
};

// Messages API functions
export const messagesAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getMessages: (conversationId) => API.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, messageData) => API.post(`/messages/${conversationId}`, messageData),
  createConversation: (recipientId) => API.post('/messages/conversations', { recipientId }),
};

export default API;