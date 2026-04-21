import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const ADMIN_API_URL = API_URL;

// Main API instance for Students and Advisors (Port 8080)
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Admin API instance (Port 8081)
const adminInstance = axios.create({
    baseURL: ADMIN_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for main api
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for admin instance
adminInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth APIs (Using 8080)
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    updateProfile: (data) => api.post('/auth/profile/update', data),
    changePassword: (data) => api.post('/auth/password/change', data),
};

// User APIs (Using 8080)
export const userApi = {
    getProfile: () => api.get('/auth/profile'),
};

// Question APIs (Using 8080)
export const questionApi = {
    getAll: (params) => api.get('/questions', { params }),
    getById: (id) => api.get(`/questions/${id}`),
    create: (formData) => api.post('/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    answer: (id, formData) => api.post(`/questions/${id}/answer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistory: (id) => api.get(`/questions/${id}/answers`),
    getLatestAnswer: (id) => api.get(`/questions/${id}/latest-answer`),
    downloadFile: (id) => api.get(`/questions/${id}/file`, { responseType: 'blob' }),
};

// Chat / Conversation APIs (Using 8081)
export const conversationApi = {
    createConversation: (data) => api.post('/conversations', data),
    getStudentConversations: (maSv, params) => api.get(`/conversations/student/${maSv}`, { params }),
    getCvhtConversations: (maCv, params) => api.get(`/conversations/cvht/${maCv}`, { params }),
    getMessages: (conversationId) => api.get(`/conversations/${conversationId}/messages`),
    getConversationDetail: (id) => api.get(`/conversations/${id}`),
    resolveConversation: (id) => api.put(`/conversations/${id}/resolve`),
};

// Admin APIs (Using 8081)
export const adminApi = {
    createStudent: (email) => adminInstance.post('/admin/accounts/student', { email }),
    createAdvisor: (email) => adminInstance.post('/admin/accounts/advisor', { email }),
};

// Class/Filter APIs (Using 8080)
export const classApi = {
    getAll: () => api.get('/classes'),
    getCohorts: () => api.get('/classes/cohorts'),
    getMajors: () => api.get('/classes/majors'),
};

// FAQ APIs (Using 8081)
export const faqApi = {
    getAll: (params) => api.get('/faq', { params }),
    getById: (id) => api.get(`/faq/${id}`),
};

// AI Chatbot APIs
export const aiApi = {
    chat: (message) => api.post('/ai/chat', { message })
};

export default api;
