import { create } from 'zustand';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('auth_token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (name, email, password, passwordConfirmation) => {
    const { data } = await authApi.register(name, email, password, passwordConfirmation);
    localStorage.setItem('auth_token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await authApi.me();
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
