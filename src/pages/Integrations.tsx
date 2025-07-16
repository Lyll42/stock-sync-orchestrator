
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Webhook, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Bell
} from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { toast } from "@/hooks/use-toast";

const Integrations = () => {
  const { subscribeToWebhook, unsubscribeFromWebhook, isConnected, connectionStatus } = useEvents();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState([
    {
      id: "1",
      name: "Stock Alerts",
      url: "https://api.company.com/webhook/stock-alert",
      status: "active",
      lastTriggered: "2024-01-15 14:30:00",
      events: 145
    },
    {
      id: "2", 
      name: "Order Sync",
      url: "https://api.company.com/webhook/order-sync",
      status: "active",
      lastTriggered: "2024-01-15 15:45:00",
      events: 89
    },
    {
      id: "3",
      name: "Product Updates",
      url: "https://api.company.com/webhook/product-update",
      status: "inactive",
      lastTriggered: "2024-01-14 09:15:00",
      events: 12
    }
  ]);

  const handleConnect = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de webhook válida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      subscribeToWebhook(webhookUrl);
      toast({
        title: "¡Conectado!",
        description: "Conexión con webhook establecida exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el webhook. Verifica la URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    unsubscribeFromWebhook();
    toast({
      title: "Desconectado",
      description: "Conexión con webhook terminada",
    });
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integraciones Webhook</h1>
        <p className="text-muted-foreground mt-2">
          Configura y gestiona las conexiones con flujos de trabajo automatizados
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${getConnectionColor()}`} />
            Estado de Conexión
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {connectionStatus === 'connected' ? 'Conectado' : 
               connectionStatus === 'connecting' ? 'Conectando...' : 
               connectionStatus === 'error' ? 'Error' : 'Desconectado'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Conexión en tiempo real con webhooks para eventos automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="webhook-url">URL del Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhook/endpoint"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isConnected}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading ? "Conectando..." : "Conectar"}
              </Button>
            ) : (
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Desconectar
              </Button>
            )}
          </div>

          {isConnected && (
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Conexión activa: Recibiendo eventos en tiempo real desde webhook
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="logs">Logs de Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks Configurados
              </CardTitle>
              <CardDescription>
                Gestiona los endpoints para recibir datos desde webhooks externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(webhook.status)}
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Último evento: {webhook.lastTriggered}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {webhook.events} eventos
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.status === 'active'}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Intervalo de Sincronización</Label>
                  <Input type="number" placeholder="30" />
                  <p className="text-xs text-muted-foreground">Segundos entre sincronizaciones</p>
                </div>
                <div className="space-y-2">
                  <Label>Timeout de Webhook</Label>
                  <Input type="number" placeholder="5000" />
                  <p className="text-xs text-muted-foreground">Milisegundos de timeout</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reintentos Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Reintentar automáticamente webhooks fallidos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones en Tiempo Real</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificaciones de eventos webhook
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
              <CardDescription>
                Historial de eventos y actividad de integraciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "15:45:23", event: "Webhook recibido", status: "success", details: "Stock actualizado para 3 productos" },
                  { time: "15:42:10", event: "Sincronización completada", status: "success", details: "Datos sincronizados con e-commerce" },
                  { time: "15:38:45", event: "Alerta enviada", status: "warning", details: "Stock bajo para producto ABC123" },
                  { time: "15:35:12", event: "Conexión establecida", status: "info", details: "WebSocket conectado exitosamente" },
                  { time: "15:30:00", event: "Error de conexión", status: "error", details: "Timeout en webhook de órdenes" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' :
                        log.status === 'warning' ? 'bg-yellow-500' :
                        log.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
