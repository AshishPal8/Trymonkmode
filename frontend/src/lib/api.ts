import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Crucial for Web: Automatically sends and receives HTTP-Only Cookies (access_token, refresh_token)
  withCredentials: true,
});

// Request Interceptor: Attach Bearer token as fallback if present in storage (for Mobile/App environments)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('trymonk_access_token') || localStorage.getItem('aura_access_token');
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh on 401 via HTTP-Only Cookies (Web) or Bearer Token (App)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const fallbackRefreshToken = localStorage.getItem('trymonk_refresh_token') || localStorage.getItem('aura_refresh_token') || undefined;

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          fallbackRefreshToken ? { refreshToken: fallbackRefreshToken } : {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('trymonk_access_token', newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('trymonk_refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        localStorage.removeItem('trymonk_access_token');
        localStorage.removeItem('trymonk_refresh_token');
        localStorage.removeItem('aura_access_token');
        localStorage.removeItem('aura_refresh_token');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// Strongly-Typed API Client Methods
// ==========================================

export const authApi = {
  sendOtp: (email: string, name?: string, type?: 'login' | 'signup') =>
    api.post('/auth/send-otp', { email, name, type }),
  verifyOtp: (email: string, otp: string, name?: string, type?: 'login' | 'signup') =>
    api.post('/auth/verify-otp', { email, otp, name, type }),
  refreshToken: (refreshToken?: string) => api.post('/auth/refresh-token', refreshToken ? { refreshToken } : {}),
  getMe: () => api.get('/auth/me'),
  logout: (refreshToken?: string) => api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};

export const pagesApi = {
  getPages: () => api.get('/pages'),
  getAllPagesAdmin: () => api.get('/pages/admin/all'),
  createPage: (data: any) => api.post('/pages', data),
  updatePage: (id: number, data: any) => api.patch(`/pages/${id}`, data),
  togglePage: (id: number) => api.post(`/pages/${id}/toggle`),
};

export const journalApi = {
  getEntries: () => api.get('/journal'),
  getEntryByDate: (date: string) => api.get(`/journal/date/${date}`),
  saveEntry: (data: any) => api.post('/journal', data),
  deleteEntry: (id: number) => api.delete(`/journal/${id}`),
  getDailyPrompt: (shuffle = false) => api.get(`/journal/daily-prompt${shuffle ? '?shuffle=true' : ''}`),
};

export const tasksApi = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: number, data: any) => api.patch(`/tasks/${id}`, data),
  toggleTask: (id: number) => api.post(`/tasks/${id}/toggle`),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export const habitsApi = {
  getHabits: () => api.get('/habits'),
  createHabit: (data: any) => api.post('/habits', data),
  updateHabit: (id: number, data: any) => api.patch(`/habits/${id}`, data),
  toggleCheckIn: (id: number, date: string) => api.post(`/habits/${id}/check-in`, { date }),
  deleteHabit: (id: number) => api.delete(`/habits/${id}`),
};

export const calendarApi = {
  getEvents: (date?: string) => api.get('/calendar', { params: { date } }),
  createEvent: (data: any) => api.post('/calendar', data),
  updateEvent: (id: number, data: any) => api.patch(`/calendar/${id}`, data),
  deleteEvent: (id: number) => api.delete(`/calendar/${id}`),
};

export const financeApi = {
  getOverview: (params?: { timeframe?: 'daily' | 'monthly' | 'yearly' | 'all'; date?: string; month?: string; year?: string }) =>
    api.get('/finance', { params }),
  createTransaction: (data: any) => api.post('/finance', data),
  deleteTransaction: (id: number) => api.delete(`/finance/${id}`),
};

export const goalsApi = {
  getGoals: (timeframe?: string) => api.get('/goals', { params: { timeframe } }),
  createGoal: (data: any) => api.post('/goals', data),
  updateGoal: (id: number, data: any) => api.patch(`/goals/${id}`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
};

export const notesApi = {
  getNotes: () => api.get('/notes'),
  createNote: (data: { title: string; content: string; color?: string; isPinned?: boolean; tags?: string[] }) =>
    api.post('/notes', data),
  updateNote: (id: number, data: { title?: string; content?: string; color?: string; isPinned?: boolean; tags?: string[] }) =>
    api.patch(`/notes/${id}`, data),
  deleteNote: (id: number) => api.delete(`/notes/${id}`),
};

export const bookmarksApi = {
  getBookmarks: (category?: string) => api.get('/bookmarks', { params: { category } }),
  createBookmark: (data: any) => api.post('/bookmarks', data),
  updateBookmark: (id: number, data: any) => api.patch(`/bookmarks/${id}`, data),
  togglePin: (id: number) => api.post(`/bookmarks/${id}/pin`),
  deleteBookmark: (id: number) => api.delete(`/bookmarks/${id}`),
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  getAllUsers: () => api.get('/users/all'),
  updateRoleTier: (id: number, data: any) => api.patch(`/users/${id}/role-tier`, data),
};

export const analyticsApi = {
  getAnalytics: () => api.get('/analytics'),
};

export const blogsApi = {
  getPublicBlogs: (params?: { page?: number | string; limit?: number | string; search?: string; tag?: string }) =>
    api.get('/blogs', { params }),
  getBlogBySlug: (slug: string) => api.get(`/blogs/${slug}`),
  getAllBlogsAdmin: (params?: { page?: number | string; limit?: number | string; search?: string }) =>
    api.get('/blogs/admin/all', { params }),
  createBlog: (data: any) => api.post('/blogs', data),
  updateBlog: (id: number, data: any) => api.patch(`/blogs/${id}`, data),
  deleteBlog: (id: number) => api.delete(`/blogs/${id}`),
};

export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};