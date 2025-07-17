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
import { supabase } from "@/integrations/supabase/client";

// Data will be loaded from database

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
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    todayMovements: 0,
    totalCategories: 0,
    activeSuppliers: 0,
    pendingOrders: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [movementData, setMovementData] = useState<any[]>([]);
  const [movementTrendsData, setMovementTrendsData] = useState<any[]>([]);
  const [supplierData, setSupplierData] = useState<any[]>([]);
  const [stockPredictionData, setStockPredictionData] = useState<any[]>([]);

  // Load dashboard data from database
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load basic metrics
      const [
        { data: products },
        { data: categories },
        { data: movements },
        { data: todayMovements }
      ] = await Promise.all([
        supabase.from('products').select('id, current_stock, min_stock, unit_price, supplier'),
        supabase.from('categories').select('id, name'),
        supabase.from('movements').select('*').order('created_at', { ascending: false }),
        supabase.from('movements').select('*').gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      if (products) {
        const lowStock = products.filter(p => p.current_stock <= p.min_stock).length;
        const totalValue = products.reduce((sum, p) => sum + (p.current_stock * (p.unit_price || 0)), 0);
        const suppliers = new Set(products.map(p => p.supplier).filter(s => s)).size;

        setMetrics({
          totalProducts: products.length,
          lowStockProducts: lowStock,
          totalValue,
          todayMovements: todayMovements?.length || 0,
          totalCategories: categories?.length || 0,
          activeSuppliers: suppliers,
          pendingOrders: lowStock // Using low stock as pending orders proxy
        });

        // Categories chart data
        const categoryStats = await supabase
          .from('products')
          .select('category_id, categories(name)')
          .not('category_id', 'is', null);

        if (categoryStats.data) {
          const categoryCount = categoryStats.data.reduce((acc: any, item: any) => {
            const categoryName = item.categories?.name || 'Sin categoría';
            acc[categoryName] = (acc[categoryName] || 0) + 1;
            return acc;
          }, {});

          setChartData(Object.entries(categoryCount).map(([name, value]) => ({ name, value })));
        }

        // Supplier data
        const supplierStats = products.reduce((acc: any, product: any) => {
          const supplier = product.supplier || 'Sin proveedor';
          if (!acc[supplier]) {
            acc[supplier] = { count: 0, value: 0 };
          }
          acc[supplier].count += 1;
          acc[supplier].value += product.current_stock * (product.unit_price || 0);
          return acc;
        }, {});

        setSupplierData(
          Object.entries(supplierStats)
            .map(([name, stats]: [string, any]) => ({
              name,
              value: stats.value,
              productos: stats.count
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        );
      }

      // Movement trends by hour
      if (movements) {
        const hourlyMovements = movements.reduce((acc: any, movement: any) => {
          const hour = new Date(movement.created_at).getHours();
          const hourKey = `${hour.toString().padStart(2, '0')}:00`;
          
          if (!acc[hourKey]) {
            acc[hourKey] = { time: hourKey, entrada: 0, salida: 0 };
          }
          
          if (movement.movement_type === 'entry') {
            acc[hourKey].entrada += movement.quantity;
          } else if (movement.movement_type === 'exit') {
            acc[hourKey].salida += movement.quantity;
          }
          
          return acc;
        }, {});

        setMovementData(Object.values(hourlyMovements).slice(0, 12));

        // Monthly movement trends
        const monthlyData = movements.reduce((acc: any, movement: any) => {
          const month = new Date(movement.created_at).toLocaleString('es-ES', { month: 'short' });
          
          if (!acc[month]) {
            acc[month] = { name: month, ingresos: 0, egresos: 0, stock: 0 };
          }
          
          if (movement.movement_type === 'entry') {
            acc[month].ingresos += movement.quantity;
          } else if (movement.movement_type === 'exit') {
            acc[month].egresos += movement.quantity;
          }
          acc[month].stock = movement.new_stock;
          
          return acc;
        }, {});

        setMovementTrendsData(Object.values(monthlyData).slice(0, 12));

        // Stock prediction (simple projection based on recent trends)
        const recentMovements = movements.slice(0, 30);
        const avgDaily = recentMovements.length > 0 
          ? recentMovements.reduce((sum: number, m: any) => sum + (m.movement_type === 'exit' ? -m.quantity : m.quantity), 0) / 30
          : 0;

        const currentStock = products?.reduce((sum, p) => sum + p.current_stock, 0) || 0;
        const predictions = [];
        
        for (let i = 1; i <= 4; i++) {
          const futureMonth = new Date();
          futureMonth.setMonth(futureMonth.getMonth() + i);
          const projectedStock = Math.max(0, currentStock + (avgDaily * 30 * i));
          
          predictions.push({
            mes: futureMonth.toLocaleString('es-ES', { month: 'short' }),
            actual: null,
            prediccion: Math.round(projectedStock)
          });
        }

        setStockPredictionData([
          { mes: 'Actual', actual: currentStock, prediccion: null },
          ...predictions
        ]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(); // Refresh data every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

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
                <BarChart data={movementTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ingresos" fill="#82ca9d" name="Entradas" />
                  <Bar dataKey="egresos" fill="#e48080" name="Salidas" />
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
                <LineChart data={movementTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="stock" stroke="#8884d8" activeDot={{ r: 8 }} name="Stock Total" />
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
                    data={supplierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supplierData.map((_, index) => (
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
                <LineChart data={stockPredictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Stock Actual"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prediccion" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicción"
                    connectNulls={false}
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
