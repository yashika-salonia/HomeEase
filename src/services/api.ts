import axios from 'axios';
import type {
  Booking,
  BookingStats,
  BookingStatus,
  Review,
  User,
  Worker,
} from '../types';

export const TOKEN_STORAGE_KEY = 'homeease_jwt_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: string[] } | undefined;
    if (data?.message) return data.message;
    if (data?.errors && data.errors.length > 0) return data.errors[0];
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const authApi = {
  async register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    location: string;
    role: 'customer' | 'worker';
  }) {
    const { data } = await api.post<{
      success: boolean;
      token: string;
      user: User;
      hasWorkerProfile: boolean;
      message: string;
    }>('/auth/register', payload);
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<{
      success: boolean;
      token: string;
      user: User;
      hasWorkerProfile: boolean;
      workerProfile?: Worker | null;
      message: string;
    }>('/auth/login', payload);
    return data;
  },

  async getMe() {
    const { data } = await api.get<{
      success: boolean;
      user: User;
      hasWorkerProfile: boolean;
      workerProfile?: Worker | null;
    }>('/auth/me');
    return data;
  },
};

export const workersApi = {
  async list(params: Record<string, string> = {}) {
    const { data } = await api.get<{
      success: boolean;
      count: number;
      workers: Worker[];
    }>('/workers', { params });
    return data;
  },

  async search(params: Record<string, string> = {}) {
    const { data } = await api.get<{
      success: boolean;
      count: number;
      workers: Worker[];
    }>('/workers/search', { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<{
      success: boolean;
      worker: Worker;
      reviews: Review[];
    }>(`/workers/${id}`);
    return data;
  },

  async getMyProfile() {
    const { data } = await api.get<{
      success: boolean;
      workerProfile: Worker | null;
    }>('/workers/me/profile');
    return data;
  },

  async createProfile(payload: {
    serviceCategories: string[];
    experience: number;
    description: string;
    pricingType: 'hourly' | 'daily';
    price: number;
    workingHours: string;
    availability: boolean;
  }) {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      workerProfile: Worker;
    }>('/workers/profile', payload);
    return data;
  },

  async updateProfile(payload: {
    serviceCategories: string[];
    experience: number;
    description: string;
    pricingType: 'hourly' | 'daily';
    price: number;
    workingHours: string;
    availability: boolean;
  }) {
    const { data } = await api.put<{
      success: boolean;
      message: string;
      workerProfile: Worker;
    }>('/workers/profile', payload);
    return data;
  },
};

export const bookingsApi = {
  async create(payload: {
    workerId: string;
    serviceCategory: string;
    serviceDate: string;
    preferredTime: string;
    address: string;
    instructions?: string;
  }) {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      booking: Booking;
    }>('/bookings', payload);
    return data;
  },

  async getMyBookings(params: { status?: string; search?: string } = {}) {
    const { data } = await api.get<{
      success: boolean;
      stats: BookingStats;
      count: number;
      bookings: Booking[];
    }>('/bookings/my', { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<{
      success: boolean;
      booking: Booking;
    }>(`/bookings/${id}`);
    return data;
  },

  async updateStatus(id: string, status: BookingStatus, note?: string) {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      booking: Booking;
    }>(`/bookings/${id}/status`, { status, note });
    return data;
  },

  async cancel(id: string, reason?: string) {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      booking: Booking;
    }>(`/bookings/${id}/cancel`, { reason });
    return data;
  },
};

export const reviewsApi = {
  async create(payload: { bookingId: string; rating: number; comment: string }) {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      review: Review;
      workerStats: { averageRating: number; totalReviews: number };
    }>('/reviews', payload);
    return data;
  },

  async getForWorker(workerId: string) {
    const { data } = await api.get<{
      success: boolean;
      count: number;
      reviews: Review[];
    }>(`/reviews/worker/${workerId}`);
    return data;
  },

  async getMyReviews() {
    const { data } = await api.get<{
      success: boolean;
      count: number;
      reviews: Review[];
    }>('/reviews/my');
    return data;
  },
};

export const usersApi = {
  async getProfile() {
    const { data } = await api.get<{
      success: boolean;
      user: User;
      workerProfile?: Worker | null;
    }>('/users/profile');
    return data;
  },

  async updateProfile(payload: {
    name: string;
    phone: string;
    location: string;
    profileImage?: string;
  }) {
    const { data } = await api.put<{
      success: boolean;
      message: string;
      user: User;
    }>('/users/profile', payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await api.put<{
      success: boolean;
      message: string;
    }>('/users/change-password', payload);
    return data;
  },
};

export default api;
