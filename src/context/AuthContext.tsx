import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as User;
      setUser(parsed);
    } catch {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login({ email, password });

    if (!result?.user) return false;

    const mappedUser: User = {
      id: String(result.user.id),
      name: result.user.name,
      email: result.user.email,
    };

    setUser(mappedUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(mappedUser));
    if (result.token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, result.token);
    }

    return true;
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    const result = await authService.register({ name, email, phone, password });

    if (!result?.user) return false;

    const mappedUser: User = {
      id: String(result.user.id),
      name: result.user.name,
      email: result.user.email,
    };

    setUser(mappedUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(mappedUser));
    if (result.token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, result.token);
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
