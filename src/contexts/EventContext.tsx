
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface EventData {
  id: string;
  type: 'stock_alert' | 'n8n_sync' | 'movement_registered' | 'integration_status' | 'webhook_received';
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
  subscribeToN8N: (webhookUrl: string) => void;
  unsubscribeFromN8N: () => void;
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

  const subscribeToN8N = (webhookUrl: string) => {
    if (ws) {
      ws.close();
    }

    // Simulate WebSocket connection to N8N
    // In a real implementation, this would connect to your WebSocket server
    const mockConnection = () => {
      setConnectionStatus('connecting');
      
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnected(true);
        
        addEvent({
          type: 'integration_status',
          title: 'N8N Conectado',
          message: 'Conexión establecida con N8N webhook',
          severity: 'success',
          source: 'n8n',
        });

        // Simulate periodic events from N8N
        const interval = setInterval(() => {
          const eventTypes = [
            {
              type: 'n8n_sync' as const,
              title: 'Sincronización N8N',
              message: 'Productos sincronizados desde e-commerce',
              severity: 'info' as const,
            },
            {
              type: 'stock_alert' as const,
              title: 'Alerta de Stock',
              message: 'Producto con stock bajo detectado por N8N',
              severity: 'warning' as const,
            },
            {
              type: 'webhook_received' as const,
              title: 'Webhook Recibido',
              message: 'Nueva orden procesada desde Shopify',
              severity: 'success' as const,
            },
          ];

          const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          addEvent({
            ...randomEvent,
            source: 'n8n',
            data: {
              webhookUrl,
              products: Math.floor(Math.random() * 10) + 1,
            },
          });
        }, 15000); // Event every 15 seconds

        // Store interval for cleanup
        (window as any).n8nInterval = interval;
      }, 2000);
    };

    mockConnection();
  };

  const unsubscribeFromN8N = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    
    if ((window as any).n8nInterval) {
      clearInterval((window as any).n8nInterval);
      (window as any).n8nInterval = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    addEvent({
      type: 'integration_status',
      title: 'N8N Desconectado',
      message: 'Conexión con N8N terminada',
      severity: 'info',
      source: 'system',
    });
  };

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
      if ((window as any).n8nInterval) {
        clearInterval((window as any).n8nInterval);
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
        subscribeToN8N,
        unsubscribeFromN8N,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
