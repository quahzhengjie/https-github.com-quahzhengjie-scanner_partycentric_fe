// src/components/providers/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { setupAuthInterceptor } from '@/lib/auth-interceptor';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  return <>{children}</>;
}