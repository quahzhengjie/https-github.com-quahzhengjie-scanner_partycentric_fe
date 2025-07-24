'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore, useIsAuthenticated, useAuthError } from '@/store/auth-store';

interface DemoUser {
  name: string;
  email: string;
  role: string;
  userId: string;
}

const demoUsers: DemoUser[] = [
  { name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Relationship Manager', userId: 'U001' },
  { name: 'John Smith', email: 'john.smith@example.com', role: 'Checker', userId: 'U002' },
  { name: 'Mary Anne', email: 'mary.anne@example.com', role: 'Compliance Officer', userId: 'U004' },
  { name: 'George Chan', email: 'george.chan@example.com', role: 'General Manager', userId: 'U003' },
  { name: 'Admin User', email: 'admin@example.com', role: 'Administrator', userId: 'U005' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin, isLoading } = useAuthStore();
  const { error, clearError } = useAuthError();
  const isAuthenticated = useIsAuthenticated();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      // Error is handled in the store
      console.error('Login error:', err);
    }
  };

  const handleQuickLogin = async (userId: string) => {
    try {
      await quickLogin(userId);
      router.push('/');
    } catch (err) {
      console.error('Quick login error:', err);
    }
  };

  const fillCredentials = (demoUser: DemoUser) => {
    setEmail(demoUser.email);
    setPassword('password123');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">KYC Case Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center mb-4">
              Demo Users (Password: password123)
            </h3>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => fillCredentials(user)}
                  disabled={isLoading}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.role}</div>
                  </div>
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors">→</span>
                </button>
              ))}
            </div>

            {/* Quick Login Button (Dev Mode) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
                  Development Quick Login
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.slice(0, 4).map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => handleQuickLogin(user.userId)}
                      disabled={isLoading}
                      className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
                    >
                      {user.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}