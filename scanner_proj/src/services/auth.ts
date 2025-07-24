// src/services/auth.ts
import { ApiClient } from '@/lib/api-client';
import { User } from '@/lib/types';


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private readonly USER_KEY = 'authUser';
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await ApiClient.users.login(credentials);
      
      // Store tokens and user
      this.setTokens(response.accessToken, response.refreshToken);
      this.setUser(response.user); // Added this line
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await ApiClient.users.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      this.clearUser(); // Added this line
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await ApiClient.users.current();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await ApiClient.users.refreshToken(refreshToken);
      this.setTokens(response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
  
  // User management
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  
  getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  
  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async quickLogin(userId: string): Promise<void> {
    console.warn("Quick login is for development purposes only.");
    const demoUsers: {[key: string]: {email: string, name: string}} = {
      'U001': { email: 'jane.doe@example.com', name: 'Jane Doe' },
      'U002': { email: 'john.smith@example.com', name: 'John Smith' },
      'U003': { email: 'george.chan@example.com', name: 'George Chan' },
      'U004': { email: 'mary.anne@example.com', name: 'Mary Anne' },
      'U005': { email: 'admin@example.com', name: 'Admin User' },
    };
    const user = demoUsers[userId];
    if (user) {
      await this.login({ email: user.email, password: 'password123' });
    } else {
      throw new Error("Invalid user ID for quick login");
    }
  }
}

const authService = AuthService.getInstance();
export default authService;
