import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL pointing to /api
const API = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

// Request interceptor - attach auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
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

export { API_URL };

// Auth
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData),
  getAllUsers: (params) => API.get('/auth/users', { params }),
  toggleUserStatus: (userId) => API.put(`/auth/users/${userId}/toggle-status`),
  deleteUser: (userId) => API.delete(`/auth/users/${userId}`),
};

// User
export const userAPI = {
  getMe: () => API.get('/user/me'),
  updateProfile: (data) => API.put('/user/update', data),
  getUserById: (id) => API.get(`/user/${id}`),
  searchUsers: (params) => API.get('/user/search', { params }),
  updateProfileImage: (profileImage) => API.put('/user/profile-image', { profileImage }),
};

// Posts
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

// Messages
export const messagesAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getContacts: () => API.get('/messages/contacts'),
  getMessages: (conversationId) => API.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, messageData) => API.post(`/messages/${conversationId}`, messageData),
  createConversation: (data) => API.post('/messages/conversations', data),
  markAsRead: (conversationId) => API.put(`/messages/${conversationId}/read`),
};

// Events
export const eventsAPI = {
  getAllEvents: (params) => API.get('/events', { params }),
  getEvent: (id) => API.get(`/events/${id}`),
  createEvent: (eventData) => API.post('/events', eventData),
  updateEvent: (id, eventData) => API.put(`/events/${id}`, eventData),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  registerForEvent: (id) => API.post(`/events/${id}/register`),
  unregisterFromEvent: (id) => API.delete(`/events/${id}/unregister`),
  getMyEvents: () => API.get('/events/my-events'),
};

// Jobs
export const jobsAPI = {
  getJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (jobData) => API.post('/jobs', jobData),
  updateJob: (id, jobData) => API.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
};

// Applications
export const applicationsAPI = {
  apply: (data) => API.post('/applications', data),
  getMyApplications: () => API.get('/applications/my'),
  updateStatus: (id, status) => API.put(`/applications/${id}/status`, { status }),
};

// Rewards
export const rewardsAPI = {
  getMyRewards: () => API.get('/rewards/me'),
};

// Profiles
export const profilesAPI = {
  getAlumniProfiles: (params) => API.get('/profiles/alumni', { params }),
  getAlumniProfile: (id) => API.get(`/profiles/alumni/${id}`),
  getSimilarAlumni: (id) => API.get(`/profiles/alumni/${id}/similar`),
};

// AI Matching
export const aiMatchingAPI = {
  getSuggestions: () => API.get('/ai-matching/suggestions'),
  getProfile: () => API.get('/ai-matching/profile'),
  updateProfile: (data) => API.put('/ai-matching/profile', data),
  getProfileStatus: () => API.get('/ai-matching/profile-status'),
  sendRequest: (data) => API.post('/ai-matching/request', data),
  respondToRequest: (data) => API.post('/ai-matching/respond', data),
  getStatus: () => API.get('/ai-matching/status'),
};

// Verification
export const verificationAPI = {
  submitRequest: (institutions) => API.post('/verification/request', { institutions }),
  getMyStatus: () => API.get('/verification/my-status'),
  getPending: () => API.get('/verification/pending'),
  getAll: () => API.get('/verification/all'),
  approve: (id, notes) => API.put(`/verification/${id}/approve`, { notes }),
  reject: (id, reason) => API.put(`/verification/${id}/reject`, { reason }),
};

// Communities
export const communitiesAPI = {
  getCommunities: () => API.get('/communities'),
  createCommunity: (data) => API.post('/communities', data),
  joinLeave: (id) => API.post(`/communities/${id}/join-leave`),
  getPosts: (id) => API.get(`/communities/${id}/posts`),
  createPost: (id, data) => API.post(`/communities/${id}/posts`, data),
  upvotePost: (pid) => API.post(`/communities/posts/${pid}/upvote`),
  commentPost: (pid, content) => API.post(`/communities/posts/${pid}/comment`, { content }),
  deletePost: (pid) => API.delete(`/communities/posts/${pid}`),
};

// Meetings
export const meetingsAPI = {
  requestMeeting: (data) => API.post('/meetings/request', data),
  getMyMeetings: (status) => API.get('/meetings/my' + (status ? `?status=${status}` : '')),
  acceptMeeting: (id, scheduledAt, meetingLink, note) => API.put(`/meetings/${id}/accept`, { scheduledAt, meetingLink, note }),
  rejectMeeting: (id, reason) => API.put(`/meetings/${id}/reject`, { reason }),
  cancelMeeting: (id, reason) => API.put(`/meetings/${id}/cancel`, { reason }),
  completeMeeting: (id) => API.put(`/meetings/${id}/complete`),
};

export const adminAPI = {
  getPendingUsers: () => API.get('/auth/pending'),
  getAllUsers: (params) => API.get('/auth/users', { params }),
  approveUser: (userId, action, note) => API.patch(`/auth/approve/${userId}`, { action, note }),
  toggleUserStatus: (userId) => API.put(`/auth/users/${userId}/toggle-status`),
  deleteUser: (userId) => API.delete(`/auth/users/${userId}`),
};

// Insights
export const insightsAPI = {
  getDepartmentInsights: (dept) => API.get(`/insights/department/${dept}`),
  searchAlumni: (params) => API.get('/insights/alumni', { params }),
};

export default API;
