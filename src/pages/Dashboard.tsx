import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  ShoppingCart,
  Zap
} from "lucide-react";
import RealTimeNotifications from "@/components/notifications/RealTimeNotifications";
import { useEvents } from "@/contexts/EventContext";

// Mock data for charts
const mockData = [
  { name: 'Ene', ingresos: 2400, egresos: 1398, stock: 9800 },
  { name: 'Feb', ingresos: 1398, egresos: 2210, stock: 3908 },
  { name: 'Mar', ingresos: 9800, egresos: 2210, stock: 4800 },
  { name: 'Abr', ingresos: 3908, egresos: 2000, stock: 3800 },
  { name: 'May', ingresos: 4800, egresos: 1398, stock: 4300 },
  { name: 'Jun', ingresos: 3800, egresos: 2210, stock: 2300 },
  { name: 'Jul', ingresos: 4300, egresos: 2000, stock: 4300 },
  { name: 'Ago', ingresos: 2300, egresos: 1398, stock: 6700 },
  { name: 'Sep', ingresos: 6700, egresos: 2210, stock: 2300 },
  { name: 'Oct', ingresos: 2300, egresos: 2000, stock: 7800 },
  { name: 'Nov', ingresos: 7800, egresos: 1398, stock: 5600 },
  { name: 'Dic', ingresos: 5600, egresos: 2210, stock: 2300 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const { addEvent } = useEvents();
  const [metrics, setMetrics] = useState({
    totalProducts: 1245,
    lowStockProducts: 23,
    totalValue: 125450.75,
    todayMovements: 45,
    totalCategories: 15,
    activeSuppliers: 8,
    pendingOrders: 12,
    n8nConnections: 3
  });

  const chartData = [
    { name: 'Electrónicos', value: 400 },
    { name: 'Ropa', value: 300 },
    { name: 'Alimentos', value: 300 },
    { name: 'Hogar', value: 200 },
  ];

  const movementData = [
    { time: '08:00', entrada: 120, salida: 50 },
    { time: '10:00', entrada: 80, salida: 30 },
    { time: '12:00', entrada: 150, salida: 70 },
    { time: '14:00', entrada: 90, salida: 40 },
    { time: '16:00', entrada: 110, salida: 60 },
    { time: '18:00', entrada: 70, salida: 20 },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random metric updates
      setMetrics(prev => ({
        ...prev,
        todayMovements: prev.todayMovements + Math.floor(Math.random() * 3),
        totalValue: prev.totalValue + (Math.random() - 0.5) * 1000,
      }));

      // Simulate occasional events
      if (Math.random() < 0.3) {
        const eventTypes = [
          {
            type: 'movement_registered' as const,
            title: 'Nuevo Movimiento',
            message: 'Entrada de 25 unidades registrada',
            severity: 'success' as const,
          },
          {
            type: 'stock_alert' as const,
            title: 'Stock Bajo',
            message: 'Producto ABC123 requiere reposición',
            severity: 'warning' as const,
          },
        ];
        
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        addEvent({
          ...randomEvent,
          source: 'system',
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [addEvent]);

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Panel de control con métricas en tiempo real
          </p>
        </div>
        <div className="lg:flex-shrink-0 lg:w-96">
          <RealTimeNotifications />
        </div>
      </div>

      {/* Metrics Cards - Enhanced with real-time indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.lowStockProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
              Requieren atención inmediata
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              Actualizado en tiempo real
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayMovements}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              +{Math.floor(Math.random() * 5)} en la última hora
            </div>
          </CardContent>
        </Card>
      </div>

      {/* N8N Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Estado de Integraciones N8N
          </CardTitle>
          <CardDescription>
            Conexiones activas y métricas de sincronización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Webhooks Activos</p>
                <p className="text-2xl font-bold">{metrics.n8nConnections}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Eventos Procesados</p>
                <p className="text-2xl font-bold">147</p>
              </div>
              <Badge variant="secondary">Última hora</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Tiempo de Respuesta</p>
                <p className="text-2xl font-bold">~120ms</p>
              </div>
              <Badge variant="outline" className="text-green-600">Óptimo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Por Categorías</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Egresos</CardTitle>
              <CardDescription>
                Comparativa mensual de ingresos y egresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ingresos" fill="#82ca9d" />
                  <Bar dataKey="egresos" fill="#e48080" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Stock</CardTitle>
              <CardDescription>
                Evolución del stock a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="stock" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Categorías</CardTitle>
              <CardDescription>
                Porcentaje de productos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos por Hora</CardTitle>
              <CardDescription>
                Entradas y salidas de productos a lo largo del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={movementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSalida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="entrada" stroke="#82ca9d" fillOpacity={1} fill="url(#colorEntrada)" />
                  <Area type="monotone" dataKey="salida" stroke="#8884d8" fillOpacity={1} fill="url(#colorSalida)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
