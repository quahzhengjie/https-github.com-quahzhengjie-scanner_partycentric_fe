// src/services/websocket-service.ts

import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Define specific data types for WebSocket messages
interface CaseUpdateData {
  caseId: string;
  changes: Record<string, unknown>;
}

interface DocumentUploadData {
  documentId: string;
  caseId: string;
  uploadedBy: string;
}

interface StatusChangeData {
  entityId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}

interface UserActivityData {
  userId: string;
  activity: string;
  timestamp: string;
}

interface ErrorData {
  message: string;
  code?: string;
}

type WebSocketMessageData = 
  | CaseUpdateData 
  | DocumentUploadData 
  | StatusChangeData 
  | UserActivityData
  | ErrorData
  | Record<string, unknown>;

interface WebSocketMessage {
  type: 'case_updated' | 'document_uploaded' | 'status_changed' | 'user_activity' | 'connected' | 'disconnected' | 'error';
  entityId: string;
  entityType: 'case' | 'party' | 'document';
  data?: WebSocketMessageData;
  timestamp: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private shouldReconnect: boolean = true;
  private url: string;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  constructor(userId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8081';
    // FIX: Add the auth token to the connection URL
    const token = localStorage.getItem('authToken');
    this.url = `${protocol}//${host}/api/ws?userId=${userId}&token=${token}`;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.emitMessage('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emitMessage('disconnected', {});
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Emit error with proper data structure
        this.emitMessage('error', { 
          message: 'WebSocket connection error',
          code: 'WS_ERROR'
        });
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.emitMessage('error', { 
        message: error instanceof Error ? error.message : 'Failed to connect',
        code: 'CONNECTION_FAILED'
      });
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }

    switch (message.type) {
      case 'case_updated':
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        queryClient.invalidateQueries({ queryKey: ['cases', message.entityId] });
        break;
      
      case 'document_uploaded':
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        if (message.data && 'caseId' in message.data) {
          const docData = message.data as DocumentUploadData;
          queryClient.invalidateQueries({ queryKey: ['cases', docData.caseId] });
        }
        break;
      
      case 'status_changed':
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        this.showNotification(`Case ${message.entityId} status updated`);
        break;
    }
  }

  on(event: string, callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: (message: WebSocketMessage) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emitMessage(type: WebSocketMessage['type'], data: WebSocketMessageData) {
    const message: WebSocketMessage = {
      type,
      entityId: '',
      entityType: 'case',
      data,
      timestamp: new Date().toISOString()
    };
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }
  }

  private showNotification(message: string) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('KYC System Update', {
        body: message,
        icon: '/icon-192x192.png'
      });
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.ws?.close();
    this.listeners.clear();
  }

  send(data: WebSocketMessageData) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'user_activity',
        entityId: '',
        entityType: 'case',
        data,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
