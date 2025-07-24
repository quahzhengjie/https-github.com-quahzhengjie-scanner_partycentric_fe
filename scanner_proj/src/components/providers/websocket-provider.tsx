// src/components/providers/websocket-provider.tsx

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { WebSocketService } from '@/services/websocket-service';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    let ws: WebSocketService | null = null;
    
    if (currentUser) {
      ws = new WebSocketService(currentUser.id);
      ws.connect();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    
    return () => {
      ws?.disconnect();
    };
  }, [currentUser]);

  return <>{children}</>;
}