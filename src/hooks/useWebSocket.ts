
import { useEffect, useRef, useState } from 'react';
import { useEvents } from '@/contexts/EventContext';

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketHook {
  isConnected: boolean;
  connectionState: number;
  sendMessage: (message: any) => void;
  lastMessage: any;
  error: Event | null;
}

export const useWebSocket = (config: WebSocketConfig): WebSocketHook => {
  const { addEvent } = useEvents();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = config.reconnectAttempts ?? 5;
  const reconnectInterval = config.reconnectInterval ?? 3000;

  const connect = () => {
    try {
      ws.current = new WebSocket(config.url, config.protocols);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setConnectionState(WebSocket.OPEN);
        setError(null);
        reconnectAttempts.current = 0;
        
        addEvent({
          type: 'integration_status',
          title: 'WebSocket Conectado',
          message: 'Conexión WebSocket establecida exitosamente',
          severity: 'success',
          source: 'websocket',
        });
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionState(WebSocket.CLOSED);
        
        if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current++;
            addEvent({
              type: 'integration_status',
              title: 'Reintentando Conexión',
              message: `Intento ${reconnectAttempts.current} de ${maxReconnectAttempts}`,
              severity: 'warning',
              source: 'websocket',
            });
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          addEvent({
            type: 'integration_status',
            title: 'Conexión Fallida',
            message: 'No se pudo establecer conexión después de múltiples intentos',
            severity: 'error',
            source: 'websocket',
          });
        }
      };

      ws.current.onerror = (event) => {
        setError(event);
        addEvent({
          type: 'integration_status',
          title: 'Error de WebSocket',
          message: 'Error en la conexión WebSocket',
          severity: 'error',
          source: 'websocket',
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Process different types of messages from N8N
          if (data.type === 'stock_update') {
            addEvent({
              type: 'n8n_sync',
              title: 'Stock Actualizado',
              message: `Stock actualizado para ${data.product_name}`,
              severity: 'info',
              source: 'n8n',
              data: data,
            });
          } else if (data.type === 'low_stock_alert') {
            addEvent({
              type: 'stock_alert',
              title: 'Alerta de Stock Bajo',
              message: `${data.product_name} tiene stock crítico (${data.current_stock} unidades)`,
              severity: 'warning',
              source: 'n8n',
              data: data,
            });
          } else if (data.type === 'order_processed') {
            addEvent({
              type: 'webhook_received',
              title: 'Orden Procesada',
              message: `Nueva orden #${data.order_id} procesada`,
              severity: 'success',
              source: 'n8n',
              data: data,
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      setConnectionState(WebSocket.CONNECTING);
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError(err as Event);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      addEvent({
        type: 'integration_status',
        title: 'Error de Envío',
        message: 'No se puede enviar mensaje: WebSocket no conectado',
        severity: 'error',
        source: 'websocket',
      });
    }
  };

  useEffect(() => {
    if (config.url) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [config.url]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    lastMessage,
    error,
  };
};
