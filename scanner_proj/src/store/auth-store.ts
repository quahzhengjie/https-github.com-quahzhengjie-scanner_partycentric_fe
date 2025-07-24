// src/store/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  userId: string;
  role: string;
  email: string;
  name: string;
}

interface AuthState {
  // State
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
  getAuthHeader: () => string;
  isAuthenticated: () => boolean;
  refreshUserData: () => Promise<void>;
  
  // Development helpers
  quickLogin: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      token: null,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(errorData.message || 'Invalid credentials');
          }

          const data: LoginResponse = await response.json();
          
          // Map the response to your User type
          const user: User = {
            id: data.userId || data.username,
            name: data.name || data.username,
            email: data.email || credentials.email,
            role: data.role as User['role'],
            isActive: true,
          };

          set({ 
            currentUser: user, 
            token: data.accessToken,
            isLoading: false,
            error: null 
          });

          // Update API client with new token
          localStorage.setItem('authToken', data.accessToken);

        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed',
            currentUser: null,
            token: null
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        // Clear state
        set({ currentUser: null, token: null, error: null });
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-storage'); // Clear persisted state
        
        // Call logout endpoint (optional, for server-side cleanup)
        fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': get().getAuthHeader(),
          },
        }).catch(() => {
          // Ignore errors on logout
        });
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      // Set current user
      setCurrentUser: (user) => set({ currentUser: user }),

      // Clear error
      clearError: () => set({ error: null }),

      // Get auth header
      getAuthHeader: () => {
        const { token } = get();
        return token ? `Bearer ${token}` : '';
      },

      // Check if authenticated
      isAuthenticated: () => {
        const { currentUser, token } = get();
        return !!(currentUser && token);
      },

      // Refresh user data
      refreshUserData: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const user = await ApiClient.users.current();
          set({ currentUser: user });
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      },

      // Quick login for development
      quickLogin: async (userId: string) => {
        const userMap: Record<string, { email: string; name: string }> = {
          'U001': { email: 'jane.doe@example.com', name: 'Jane Doe' },
          'U002': { email: 'john.smith@example.com', name: 'John Smith' },
          'U003': { email: 'george.chan@example.com', name: 'George Chan' },
          'U004': { email: 'mary.anne@example.com', name: 'Mary Anne' },
          'U005': { email: 'admin@example.com', name: 'Admin User' },
        };

        const userData = userMap[userId] || userMap['U001'];
        return get().login({ 
          email: userData.email, 
          password: 'password123' 
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        token: state.token 
      }), // Only persist user and token
      onRehydrateStorage: () => (state) => {
        // After rehydration, update localStorage with token
        if (state?.token) {
          localStorage.setItem('authToken', state.token);
        }
      },
    }
  )
);

// Helper hook to check authentication status
export const useIsAuthenticated = () => {
  const { currentUser, token } = useAuthStore();
  return !!(currentUser && token);
};

// Helper hook to get current user with type safety
export const useCurrentUser = () => {
  const { currentUser } = useAuthStore();
  return currentUser;
};

// Helper hook for auth loading state
export const useAuthLoading = () => {
  const { isLoading } = useAuthStore();
  return isLoading;
};

// Helper hook for auth error
export const useAuthError = () => {
  const { error, clearError } = useAuthStore();
  return { error, clearError };
};