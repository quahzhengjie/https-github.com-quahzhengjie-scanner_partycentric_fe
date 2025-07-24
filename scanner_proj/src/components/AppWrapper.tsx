// src/components/AppWrapper.tsx
import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/hooks/useTheme';
import { WebSocketService } from '@/services/websocket-service';
import authService from '@/services/auth';
import { setupAuthInterceptor } from '@/lib/auth-interceptor';
import { Loader2 } from 'lucide-react';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  useEffect(() => {
    // Setup auth interceptor
    setupAuthInterceptor();

    // Check if user is authenticated and set up WebSocket
    const user = authService.getUser();
    if (user && authService.isAuthenticated()) {
      const ws = new WebSocketService(user.id);
      ws.connect();
      setWsService(ws);
    }

    setIsInitialized(true);

    return () => {
      wsService?.disconnect();
    };
  }, [wsService]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}