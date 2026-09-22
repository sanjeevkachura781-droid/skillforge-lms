import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '../api/endpoints';
import { api, tokenKey } from '../api/client';
import type { Role, User } from '../types/api';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    const version = sessionVersion.current;
    let active = true;
    const isCurrentSession = () => active && sessionVersion.current === version && localStorage.getItem(tokenKey) === token;

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((response) => {
        if (isCurrentSession()) setUser(response.data.data);
      })
      .catch(() => {
        if (!isCurrentSession()) return;
        localStorage.removeItem(tokenKey);
        queryClient.clear();
        setUser(null);
      })
      .finally(() => {
        if (active && sessionVersion.current === version) setLoading(false);
      });
    return () => { active = false; };
  }, [queryClient]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const token = localStorage.getItem(tokenKey);
        const isAuthentication = ['/auth/login', '/auth/register'].includes(error.config?.url);
        if (error.response?.status === 401 && token && !isAuthentication && error.config?.headers?.Authorization === `Bearer ${token}`) {
          sessionVersion.current += 1;
          localStorage.removeItem(tokenKey);
          queryClient.clear();
          setUser(null);
          setLoading(false);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [queryClient]);

  const establishUser = (data: {
    user: User;
    accessToken: string;
  }) => {
    queryClient.clear();
    localStorage.setItem(tokenKey, data.accessToken);
    setUser(data.user);
    setLoading(false);
  };

  const value: AuthContextValue = {
    user,
    loading,

    login: async (email, password) => {
      const version = ++sessionVersion.current;
      try {
        const response = await authApi.login({ email, password });
        if (sessionVersion.current === version) establishUser(response.data.data);
      } finally {
        if (sessionVersion.current === version) setLoading(false);
      }
    },

    register: async (body) => {
      const version = ++sessionVersion.current;
      try {
        const response = await authApi.register(body);
        if (sessionVersion.current === version) establishUser(response.data.data);
      } finally {
        if (sessionVersion.current === version) setLoading(false);
      }
    },

    logout: () => {
      sessionVersion.current += 1;
      queryClient.clear();
      localStorage.removeItem(tokenKey);
      setUser(null);
      setLoading(false);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
