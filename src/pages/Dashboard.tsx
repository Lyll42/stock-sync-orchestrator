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
  ShoppingCart
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
            <div className="flex items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
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
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
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
            <div className="flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
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
            <div className="flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
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

      {/* Additional Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
            <div className="flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCategories}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-blue-500 mr-1" />
              Todas activas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <div className="flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSuppliers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Activos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.pendingOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse" />
              Requieren revisión
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Por Categorías</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
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

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Proveedores</CardTitle>
              <CardDescription>
                Distribución de productos y valor por proveedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Proveedor A', value: 35, productos: 145 },
                      { name: 'Proveedor B', value: 25, productos: 89 },
                      { name: 'Proveedor C', value: 20, productos: 67 },
                      { name: 'Proveedor D', value: 15, productos: 45 },
                      { name: 'Otros', value: 5, productos: 23 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${props.payload.productos} productos`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predicción de Stock</CardTitle>
              <CardDescription>
                Proyección basada en tendencias de consumo actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={[
                    { mes: 'Jul', actual: 2300, prediccion: null },
                    { mes: 'Ago', actual: 2800, prediccion: null },
                    { mes: 'Sep', actual: 2100, prediccion: null },
                    { mes: 'Oct', actual: 2600, prediccion: null },
                    { mes: 'Nov', actual: null, prediccion: 2400 },
                    { mes: 'Dic', actual: null, prediccion: 2700 },
                    { mes: 'Ene', actual: null, prediccion: 2200 },
                    { mes: 'Feb', actual: null, prediccion: 2500 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Stock Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prediccion" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicción"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
