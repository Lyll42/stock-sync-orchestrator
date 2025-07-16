import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface EventData {
  id: string;
  type: 'stock_alert' | 'webhook_sync' | 'movement_registered' | 'integration_status' | 'webhook_received';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
  source?: string;
}

interface EventContextType {
  events: EventData[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  addEvent: (event: Omit<EventData, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  subscribeToWebhook: (webhookUrl: string) => void;
  unsubscribeFromWebhook: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const addEvent = (event: Omit<EventData, 'id' | 'timestamp'>) => {
    const newEvent: EventData = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep only last 100 events

    // Show toast notification
    toast({
      title: newEvent.title,
      description: newEvent.message,
      variant: newEvent.severity === 'error' ? 'destructive' : 'default',
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const subscribeToWebhook = (webhookUrl: string) => {
    if (ws) {
      ws.close();
    }

    // Simulate WebSocket connection
    const mockConnection = () => {
      setConnectionStatus('connecting');
      
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnected(true);
        
        addEvent({
          type: 'integration_status',
          title: 'Webhook Conectado',
          message: 'Conexión establecida con webhook externo',
          severity: 'success',
          source: 'webhook',
        });

        // Simulate periodic events from webhook
        const interval = setInterval(() => {
          const eventTypes = [
            {
              type: 'webhook_sync' as const,
              title: 'Sincronización Webhook',
              message: 'Productos sincronizados desde e-commerce',
              severity: 'info' as const,
            },
            {
              type: 'stock_alert' as const,
              title: 'Alerta de Stock',
              message: 'Producto con stock bajo detectado',
              severity: 'warning' as const,
            },
            {
              type: 'webhook_received' as const,
              title: 'Webhook Recibido',
              message: 'Nueva orden procesada exitosamente',
              severity: 'success' as const,
            },
          ];

          const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          addEvent({
            ...randomEvent,
            source: 'webhook',
            data: {
              webhookUrl,
              products: Math.floor(Math.random() * 10) + 1,
            },
          });
        }, 15000); // Event every 15 seconds

        // Store interval for cleanup
        (window as any).webhookInterval = interval;
      }, 2000);
    };

    mockConnection();
  };

  const unsubscribeFromWebhook = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    
    if ((window as any).webhookInterval) {
      clearInterval((window as any).webhookInterval);
      (window as any).webhookInterval = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    addEvent({
      type: 'integration_status',
      title: 'Webhook Desconectado',
      message: 'Conexión con webhook terminada',
      severity: 'info',
      source: 'system',
    });
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
      if ((window as any).webhookInterval) {
        clearInterval((window as any).webhookInterval);
      }
    };
  }, [ws]);

  return (
    <EventContext.Provider
      value={{
        events,
        isConnected,
        connectionStatus,
        addEvent,
        clearEvents,
        subscribeToWebhook,
        unsubscribeFromWebhook,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};