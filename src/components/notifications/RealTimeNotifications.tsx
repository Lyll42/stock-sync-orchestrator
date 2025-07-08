
import React, { useState } from 'react';
import { useEvents } from '@/contexts/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Circle, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Trash2,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RealTimeNotifications: React.FC = () => {
  const { events, isConnected, connectionStatus, clearEvents } = useEvents();
  const [isExpanded, setIsExpanded] = useState(false);

  const getEventIcon = (type: string, severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const unreadCount = events.filter(event => 
    Date.now() - event.timestamp.getTime() < 30000 // Last 30 seconds
  ).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className={cn("h-3 w-3", getConnectionStatusColor())} />
              ) : (
                <WifiOff className={cn("h-3 w-3", getConnectionStatusColor())} />
              )}
              <span className={cn("text-xs", getConnectionStatusColor())}>
                {connectionStatus === 'connected' ? 'En línea' : 
                 connectionStatus === 'connecting' ? 'Conectando...' : 
                 connectionStatus === 'error' ? 'Error' : 'Desconectado'}
              </span>
            </div>
            {events.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearEvents}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay notificaciones recientes
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Las notificaciones aparecerán aquí en tiempo real
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {events.slice(0, isExpanded ? events.length : 5).map((event, index) => (
                <div key={event.id}>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type, event.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {event.source && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {event.source}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.message}
                      </p>
                      {event.data && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {typeof event.data.products === 'number' 
                              ? `${event.data.products} productos`
                              : 'Datos adicionales'
                            }
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < (isExpanded ? events.length - 1 : Math.min(4, events.length - 1)) && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
            {events.length > 5 && (
              <div className="mt-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  {isExpanded 
                    ? 'Mostrar menos' 
                    : `Ver ${events.length - 5} notificaciones más`
                  }
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeNotifications;
