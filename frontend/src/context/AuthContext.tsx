import {
  createContext,
  useContext,
  useEffect,
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((response) => {
        setUser(response.data.data);
      })
      .catch(() => {
        localStorage.removeItem(tokenKey);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(tokenKey);
          setUser(null);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const establishUser = (data: {
    user: User;
    accessToken: string;
  }) => {
    localStorage.setItem(tokenKey, data.accessToken);
    setUser(data.user);
  };

  const value: AuthContextValue = {
    user,
    loading,

    login: async (email, password) => {
      const response = await authApi.login({
        email,
        password,
      });

      establishUser(response.data.data);
    },

    register: async (body) => {
      const response = await authApi.register(body);

      establishUser(response.data.data);
    },

    logout: () => {
      localStorage.removeItem(tokenKey);
      setUser(null);
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
