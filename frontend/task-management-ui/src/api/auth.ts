import { api } from './client';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const login = (email: string, password: string) => api.post<AuthResponse>('/auth/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { name, email, password });
