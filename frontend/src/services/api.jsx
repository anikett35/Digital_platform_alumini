import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const API = axios.create({
  baseURL: `${API_URL}/api`,
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

// Export API URL for socket connection
export { API_URL };

// Auth API functions
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData),
  getAllUsers: (params) => API.get('/auth/users', { params }),
};

// Posts API functions
export const postsAPI = {
  getAllPosts: (params) => API.get('/posts', { params }),
  getPost: (id) => API.get(`/posts/${id}`),
  createPost: (postData) => API.post('/posts', postData),
  updatePost: (id, postData) => API.put(`/posts/${id}`, postData),
  deletePost: (id) => API.delete(`/posts/${id}`),
  likePost: (id) => API.post(`/posts/${id}/like`),
  addComment: (id, commentData) => API.post(`/posts/${id}/comments`, commentData),
  deleteComment: (postId, commentId) => API.delete(`/posts/${postId}/comments/${commentId}`),
  getMyPosts: (params) => API.get('/posts/my-posts', { params }),
};

// Messages API functions
export const messagesAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getMessages: (conversationId) => API.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, messageData) => API.post(`/messages/${conversationId}`, messageData),
  createConversation: (recipientId) => API.post('/messages/conversations', { recipientId }),
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

export default API;