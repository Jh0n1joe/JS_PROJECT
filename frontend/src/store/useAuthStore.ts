import { create } from 'zustand';

export type UserRole = 'CLIENTE' | 'PROVEEDOR' | null;

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  sedeId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user_data') || 'null'),
  token: localStorage.getItem('auth_token') || null,

  login: (user, token) => {
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },
}));