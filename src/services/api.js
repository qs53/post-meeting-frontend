import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getGoogleAuthUrl: () => api.get('/auth/google'),
  googleCallback: (code) => api.get(`/auth/google/callback?code=${code}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getGoogleAccounts: () => api.get('/user/google-accounts'),
  getGoogleAuthUrl: () => api.post('/user/google-accounts/connect'),
  disconnectGoogleAccount: (accountId) => api.delete(`/user/google-accounts/${accountId}/disconnect`),
  syncGoogleAccount: (accountId) => api.post(`/user/google-accounts/${accountId}/sync`),
};

// Calendar API
export const calendarAPI = {
  getEvents: () => api.get('/calendar/events'),
};

// Meeting API
export const meetingAPI = {
  toggleNotetaker: (meetingId, notetakerEnabled) => 
    api.patch(`/meetings/${meetingId}/notetaker`, { notetaker_enabled: notetakerEnabled }),
  updateTranscript: (meetingId, transcript) => 
    api.post(`/meetings/${meetingId}/transcript`, { transcript }),
  generateContent: (meetingId, platform = 'linkedin') => 
    api.post(`/meetings/${meetingId}/generate-content`, { platform }),
  getContent: (meetingId) => api.get(`/meetings/${meetingId}/content`),
  getPastMeetings: () => api.get('/meetings/past'),
  generateSocialContent: (meetingId, data) => 
    api.post(`/meetings/${meetingId}/social-content`, data),
  getTranscript: (meetingId) => api.get(`/meetings/${meetingId}/transcript`),
  generateFollowUpEmail: (meetingId) => api.post(`/meetings/${meetingId}/follow-up-email`),
  generateSocialPost: (meetingId, platform = 'linkedin', customPrompt = null) =>
    api.post(`/meetings/${meetingId}/social-post`, { platform, custom_prompt: customPrompt }),
  postToSocial: (meetingId, platform, data) =>
    api.post(`/meetings/${meetingId}/post/${platform}`, data),
};

// Social Media API
export const socialMediaAPI = {
  getAccounts: () => api.get('/social-media/accounts'),
  connectAccount: (platform) => api.post(`/social-media/connect/${platform}`),
  postContent: (meetingId, platform) => api.post(`/meetings/${meetingId}/post/${platform}`),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
};

export default api;
