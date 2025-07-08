
import { useState, useEffect, useRef, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = (url: string | null, options: UseWebSocketOptions = {}) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [reconnectCount, setReconnectCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 3,
    reconnectInterval = 3000
  } = options;

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      setStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setReconnectCount(0);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        onDisconnect?.();
        
        // Auto-reconnect logic
        if (reconnectCount < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setStatus('error');
        onError?.(error);
      };

    } catch (error) {
      setStatus('error');
      console.error('WebSocket connection failed:', error);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectCount, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    setReconnectCount(0);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    sendMessage,
    reconnectCount,
    isConnected: status === 'connected'
  };
};
