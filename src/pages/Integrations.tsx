
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Settings, Activity, Plus, Copy, Eye, EyeOff, Trash2, Zap, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  eventType: string;
  isActive: boolean;
  secretKey: string;
  lastTriggered?: Date;
  totalCalls: number;
  successRate: number;
}

const Integrations = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("webhooks");
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  // Estado para el formulario de webhook
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    url: "",
    eventType: "",
    secretKey: "",
    isActive: true
  });

  // Configuraciones de webhook existentes
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "N8N Stock Alerts",
      url: "https://n8n.company.com/webhook/stock-alert",
      eventType: "low_stock_alert",
      isActive: true,
      secretKey: "wh_secret_123456789",
      lastTriggered: new Date("2024-01-15T10:30:00"),
      totalCalls: 145,
      successRate: 98.6
    },
    {
      id: "2",
      name: "E-commerce Sync",
      url: "https://n8n.company.com/webhook/product-sync",
      eventType: "inventory_movement",
      isActive: true,
      secretKey: "wh_secret_987654321",
      lastTriggered: new Date("2024-01-15T14:22:00"),
      totalCalls: 1250,
      successRate: 99.2
    },
    {
      id: "3",
      name: "Purchase Orders",
      url: "https://n8n.company.com/webhook/purchase-order",
      eventType: "product_update",
      isActive: false,
      secretKey: "wh_secret_456789123",
      lastTriggered: new Date("2024-01-10T09:15:00"),
      totalCalls: 67,
      successRate: 95.5
    }
  ]);

  const eventTypes = [
    { value: "low_stock_alert", label: "Alertas de Stock Bajo" },
    { value: "inventory_movement", label: "Movimientos de Inventario" },
    { value: "product_update", label: "Actualizaciones de Producto" },
    { value: "stock_received", label: "Recepciones de Stock" },
    { value: "daily_report", label: "Reportes Diarios" }
  ];

  const apiEndpoints = [
    {
      method: "POST",
      path: "/api/v1/webhooks/n8n/product-sync",
      description: "Sincronización de productos desde N8N",
      example: {
        source: "shopify",
        action: "product_sold",
        data: {
          sku: "PROD001",
          quantity_sold: 3,
          order_id: "ORDER123"
        }
      }
    },
    {
      method: "POST",
      path: "/api/v1/webhooks/n8n/purchase-order",
      description: "Recepciones de órdenes de compra",
      example: {
        source: "erp_system",
        action: "stock_received",
        data: {
          products: [
            { sku: "PROD001", quantity: 100, unit_cost: 15.50 }
          ]
        }
      }
    },
    {
      method: "GET",
      path: "/api/v1/products",
      description: "Obtener lista de productos",
      example: null
    },
    {
      method: "GET",
      path: "/api/v1/dashboard/metrics",
      description: "Métricas del dashboard",
      example: null
    }
  ];

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookForm.name || !webhookForm.url || !webhookForm.eventType) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      ...webhookForm,
      secretKey: webhookForm.secretKey || `wh_secret_${Date.now()}`,
      totalCalls: 0,
      successRate: 100
    };

    setWebhooks(prev => [...prev, newWebhook]);
    
    toast({
      title: "Éxito",
      description: "Webhook creado correctamente.",
    });

    setWebhookForm({
      name: "",
      url: "",
      eventType: "",
      secretKey: "",
      isActive: true
    });
    
    setIsCreateWebhookOpen(false);
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { ...webhook, isActive: !webhook.isActive }
        : webhook
    ));
    
    toast({
      title: "Estado actualizado",
      description: "El estado del webhook ha sido cambiado.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles.",
    });
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusBadge = (webhook: WebhookConfig) => {
    if (!webhook.isActive) {
      return <Badge variant="secondary">Inactivo</Badge>;
    }
    
    if (webhook.successRate >= 95) {
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    } else if (webhook.successRate >= 90) {
      return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
    } else {
      return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integraciones N8N</h1>
          <p className="text-muted-foreground">
            Configura y administra las conexiones con N8N para automatizar tu inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Ver Logs
          </Button>
          <Button onClick={() => setIsCreateWebhookOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Webhook
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks Salientes</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints Entrantes</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Webhooks Salientes */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Configurados</CardTitle>
              <CardDescription>
                Webhooks que envían datos de la aplicación hacia N8N
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Webhook className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{webhook.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {eventTypes.find(e => e.value === webhook.eventType)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(webhook)}
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={() => toggleWebhookStatus(webhook.id)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">URL</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
                            {webhook.url}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhook.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Clave Secreta</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                            {showSecrets[webhook.id] ? webhook.secretKey : "••••••••••••"}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSecretVisibility(webhook.id)}
                          >
                            {showSecrets[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhook.secretKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Estadísticas</Label>
                        <div className="mt-1 space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Llamadas:</span> {webhook.totalCalls}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Éxito:</span> {webhook.successRate}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {webhook.lastTriggered && (
                      <div className="text-xs text-muted-foreground">
                        Última ejecución: {webhook.lastTriggered.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Entrantes */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Endpoints disponibles para que N8N envíe datos hacia la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={endpoint.method === "POST" ? "default" : "secondary"}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${window.location.origin}${endpoint.path}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {endpoint.description}
                    </p>

                    {endpoint.example && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Ejemplo de Payload:</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(endpoint.example, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticación</CardTitle>
              <CardDescription>
                Información sobre autenticación para los endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Headers Requeridos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">Authorization: Bearer TOKEN</code>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">Content-Type: application/json</code>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Token de API</h4>
                  <div className="flex items-center gap-2">
                    <Input 
                      value="sk_live_123456789abcdef" 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button variant="outline">Regenerar</Button>
                    <Button variant="ghost">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa este token en el header Authorization de N8N
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Ajustes globales para las integraciones con N8N
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Integraciones Activas</h4>
                  <p className="text-sm text-muted-foreground">
                    Habilitar/deshabilitar todas las integraciones
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Logs Detallados</h4>
                  <p className="text-sm text-muted-foreground">
                    Registrar logs detallados de todas las llamadas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificaciones de Error</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificaciones cuando fallen las integraciones
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Timeout (segundos)</Label>
                <Input type="number" defaultValue="30" className="w-32" />
                <p className="text-xs text-muted-foreground">
                  Tiempo máximo de espera para llamadas a webhooks
                </p>
              </div>

              <div className="space-y-2">
                <Label>Reintentos</Label>
                <Input type="number" defaultValue="3" className="w-32" />
                <p className="text-xs text-muted-foreground">
                  Número de reintentos en caso de fallo
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pruebas de Conexión</CardTitle>
              <CardDescription>
                Verifica el estado de las conexiones con N8N
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Probar Todos los Webhooks
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Stock Alerts</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">E-commerce Sync</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Purchase Orders</span>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Daily Reports</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear webhook */}
      <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Webhook</DialogTitle>
            <DialogDescription>
              Configura un nuevo webhook para enviar datos hacia N8N
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Webhook *</Label>
                <Input
                  id="name"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Stock Alerts N8N"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Tipo de Evento *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={webhookForm.eventType}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, eventType: e.target.value }))}
                  required
                >
                  <option value="">Selecciona un evento</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="url">URL del Webhook *</Label>
                <Input
                  id="url"
                  type="url"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://n8n.company.com/webhook/..."
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="secretKey">Clave Secreta (opcional)</Label>
                <Input
                  id="secretKey"
                  value={webhookForm.secretKey}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="Se generará automáticamente si se deja vacío"
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={webhookForm.isActive}
                  onCheckedChange={(checked) => setWebhookForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Webhook Activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateWebhookOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Crear Webhook
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;
