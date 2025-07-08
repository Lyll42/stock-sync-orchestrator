
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Package, TrendingDown, DollarSign, Activity, AlertTriangle, Users } from "lucide-react";

const Dashboard = () => {
  // Datos de ejemplo para las métricas
  const metrics = {
    totalProducts: 1247,
    lowStockProducts: 23,
    inventoryValue: 125000.50,
    todayMovements: 45,
    inactiveProducts: 8,
    totalSuppliers: 12
  };

  // Datos para gráficos
  const stockTrendData = [
    { date: '01/01', stock: 1200 },
    { date: '02/01', stock: 1180 },
    { date: '03/01', stock: 1250 },
    { date: '04/01', stock: 1300 },
    { date: '05/01', stock: 1280 },
    { date: '06/01', stock: 1320 },
    { date: '07/01', stock: 1247 }
  ];

  const topProductsData = [
    { name: 'Laptop Dell XPS', movements: 45 },
    { name: 'Mouse Logitech', movements: 38 },
    { name: 'Teclado Mecánico', movements: 32 },
    { name: 'Monitor 24"', movements: 28 },
    { name: 'Auriculares Sony', movements: 25 }
  ];

  const categoryData = [
    { name: 'Electrónicos', value: 45, color: '#8884d8' },
    { name: 'Oficina', value: 30, color: '#82ca9d' },
    { name: 'Accesorios', value: 15, color: '#ffc658' },
    { name: 'Otros', value: 10, color: '#ff7300' }
  ];

  const movementsData = [
    { date: '01/01', entradas: 120, salidas: 95 },
    { date: '02/01', entradas: 100, salidas: 110 },
    { date: '03/01', entradas: 150, salidas: 85 },
    { date: '04/01', entradas: 80, salidas: 120 },
    { date: '05/01', entradas: 130, salidas: 100 },
    { date: '06/01', entradas: 110, salidas: 90 },
    { date: '07/01', entradas: 90, salidas: 105 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Resumen general del estado de tu inventario
          </p>
        </div>
        <Button>
          Generar Reporte
        </Button>
      </div>

      {/* Métricas Principales */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.lowStockProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.inventoryValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayMovements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.inactiveProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSuppliers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Stock</CardTitle>
            <CardDescription>Evolución del inventario en los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="stock" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Productos Más Movidos</CardTitle>
            <CardDescription>Productos con mayor actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="movements" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entradas vs Salidas</CardTitle>
            <CardDescription>Comparativa de movimientos semanales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={movementsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="entradas" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="salidas" stackId="1" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>Porcentaje de productos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Actividad Reciente */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Stock</CardTitle>
            <CardDescription>Productos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="font-medium">Laptop HP Pavilion</p>
                  <p className="text-sm text-muted-foreground">SKU: LAP001 - Stock: 3 unidades</p>
                </div>
              </div>
              <Badge variant="destructive">Crítico</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">Mouse Inalámbrico</p>
                  <p className="text-sm text-muted-foreground">SKU: MOU001 - Stock: 8 unidades</p>
                </div>
              </div>
              <Badge variant="secondary">Bajo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="font-medium">Teclado Mecánico</p>
                  <p className="text-sm text-muted-foreground">SKU: TEC001 - Stock: 12 unidades</p>
                </div>
              </div>
              <Badge variant="secondary">Bajo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos movimientos y eventos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Nueva entrada registrada</p>
                <p className="text-sm text-muted-foreground">50 unidades de Laptop Dell XPS por Juan Pérez</p>
                <p className="text-xs text-muted-foreground">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Integración N8N ejecutada</p>
                <p className="text-sm text-muted-foreground">3 productos sincronizados desde Shopify</p>
                <p className="text-xs text-muted-foreground">Hace 1 hora</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div className="flex-1">
                <p className="font-medium">Alerta de stock bajo</p>
                <p className="text-sm text-muted-foreground">Mouse Inalámbrico por debajo del mínimo</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
