import { apiClient } from './apiClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

// Normalized user shape used on the frontend
export interface AuthUser {
  id: number;
  customerId?: number;
  name: string;
  email: string;
  role?: string;
}

// DTO coming from backend (AuthResultDto)
interface AuthApiResponse {
  token: string;
  userId: number;
  customerId?: number;
  name: string;
  email: string;
  role?: string;
}

function normalizeAuthResponse(payload: AuthApiResponse): { token: string; user: AuthUser } {
  const user: AuthUser = {
    id: payload.userId,
    customerId: payload.customerId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };

  return { token: payload.token, user };
}

export const authService = {
  async login(data: LoginPayload) {
    const res = await apiClient.post<AuthApiResponse>('/api/Auth/login', data);
    return normalizeAuthResponse(res);
  },

  async register(data: RegisterPayload) {
    const res = await apiClient.post<AuthApiResponse>('/api/Auth/register', data);
    return normalizeAuthResponse(res);
  },
};
