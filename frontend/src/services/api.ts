import axios from 'axios';
import {
  DashboardData,
  FullProject,
  ProjectCardData,
  ResumeBriefing,
  ProjectContextBrief,
  ContextGraphData,
  Task,
  Decision,
  Document,
  Meeting,
  User,
} from '../types';

let rawBase = import.meta.env.VITE_API_URL || '/api';
if (rawBase.startsWith('http') && !rawBase.endsWith('/api')) {
  rawBase = rawBase.replace(/\/+$/, '') + '/api';
}
const API_BASE_URL = rawBase;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('contextos_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API Service Functions
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  demoLogin: async (): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/demo-login');
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get('/dashboard');
    return res.data.data;
  },
};

export const projectApi = {
  getAll: async (): Promise<ProjectCardData[]> => {
    const res = await api.get('/projects');
    return res.data.data;
  },
  getAllProjects: async (): Promise<ProjectCardData[]> => {
    const res = await api.get('/projects');
    return res.data.data;
  },
  createProject: async (data: { name: string; description: string; status?: string }): Promise<FullProject> => {
    const res = await api.post('/projects', data);
    return res.data.data;
  },
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  getById: async (id: string): Promise<FullProject> => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },
  getTasks: async (id: string): Promise<Task[]> => {
    const res = await api.get(`/projects/${id}/tasks`);
    return res.data.data;
  },
  createTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const res = await api.post(`/projects/${id}/tasks`, data);
    return res.data.data;
  },
  updateTask: async (projectId: string, taskId: string, data: Partial<Task>): Promise<Task> => {
    const res = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
    return res.data.data;
  },
  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
  createDocument: async (projectId: string, data: Partial<Document>): Promise<Document> => {
    const res = await api.post(`/projects/${projectId}/documents`, data);
    return res.data.data;
  },
  deleteDocument: async (projectId: string, docId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/documents/${docId}`);
  },
  createMeeting: async (projectId: string, data: Partial<Meeting>): Promise<Meeting> => {
    const res = await api.post(`/projects/${projectId}/meetings`, data);
    return res.data.data;
  },
  createDecision: async (id: string, data: Partial<Decision>): Promise<Decision> => {
    const res = await api.post(`/projects/${id}/decisions`, data);
    return res.data.data;
  },
  deleteDecision: async (projectId: string, decisionId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/decisions/${decisionId}`);
  },
  resumeWork: async (id: string): Promise<ResumeBriefing> => {
    const res = await api.post(`/projects/${id}/resume`);
    return res.data.data;
  },
  generateContextBrief: async (id: string): Promise<ProjectContextBrief> => {
    const res = await api.post(`/projects/${id}/context-brief`);
    return res.data.data;
  },
  getContextGraph: async (id: string): Promise<ContextGraphData> => {
    const res = await api.get(`/projects/${id}/context-graph`);
    return res.data.data;
  },
  getChanges: async (id: string): Promise<any> => {
    const res = await api.get(`/projects/${id}/changes`);
    return res.data.data;
  },
};

export default api;
