// src/components/providers/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { setupAuthInterceptor ,startTokenExpiryHeartbeat} from '@/lib/auth-interceptor';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupAuthInterceptor();
    startTokenExpiryHeartbeat();
  }, []);

  return <>{children}</>;
}