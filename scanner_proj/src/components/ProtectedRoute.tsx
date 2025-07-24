'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Still loading the user state from storage
    if (isLoading) return;

    const isAuthPage = pathname === '/login';

    // If there's no user and we're not on the login page, redirect to login
    if (!currentUser && !isAuthPage) {
      router.replace('/login');
    }
    // If there is a user and we're on the login page, redirect to the dashboard
    else if (currentUser && isAuthPage) {
      router.replace('/');
    }
  }, [isLoading, currentUser, pathname, router]);

  // Show a loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // To prevent content flashing, render nothing if a redirect is imminent
  if ((!currentUser && pathname !== '/login') || (currentUser && pathname === '/login')) {
      return null;
  }

  // Otherwise, show the intended page
  return <>{children}</>;
}