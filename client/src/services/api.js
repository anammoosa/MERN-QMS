import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8002/api';
const AUTH_URL = `${GATEWAY_URL}/auth`;
const QUIZ_URL = `${GATEWAY_URL}/quizzes`;
const ASSESSMENT_URL = `${GATEWAY_URL}/assessment`;
const REPORTING_URL = `${GATEWAY_URL}/reporting`;

const api = axios.create({
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // window.location.href = '/login'; // Optional: auto-redirect
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post(`${AUTH_URL}/login`, data),
  register: (data) => api.post(`${AUTH_URL}/register`, data),
  getInstructors: () => api.get(`${AUTH_URL}/instructors`),
};

export const quizService = {
  getQuizzes: () => api.get(QUIZ_URL),
  getInstructorQuizzes: (instructorId) => api.get(`${QUIZ_URL}/instructor/${instructorId}`),
  getQuiz: (id) => api.get(`${QUIZ_URL}/${id}`),
  createQuiz: (data) => api.post(`${QUIZ_URL}/create`, data),
  importQuiz: (data) => api.post(`${QUIZ_URL}/import`, data),
  importQuizDocx: (formData) => api.post(`${QUIZ_URL}/import-docx`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportQuiz: (id) => api.get(`${QUIZ_URL}/export/${id}`),
  exportQuizDocx: (id) => api.get(`${QUIZ_URL}/export-docx/${id}`, { responseType: 'blob' }),
  deleteQuiz: (id) => api.delete(`${QUIZ_URL}/${id}`),
};

export const assessmentService = {
  submitQuiz: (data) => api.post(`${ASSESSMENT_URL}/submit`, data),
  saveDraft: (data) => api.post(`${ASSESSMENT_URL}/save-draft`, data),
  uploadSubmission: (data) => api.post(`${ASSESSMENT_URL}/upload-submission`, data),
};

export const reportingService = {
  getInstructorStats: () => api.get(`${REPORTING_URL}/instructor-stats`),
  getStudentStats: () => api.get(`${REPORTING_URL}/student-stats`),
  getStudentHistory: (userId) => api.get(`${ASSESSMENT_URL}/history/student/${userId}`),
  getPdf: (submissionId) => api.get(`${REPORTING_URL}/pdf/${submissionId}`, { responseType: 'blob' }),
};

export default api;
