import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Eye, 
  Truck, 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Order {
  id: string;
  order_number: string;
  supplier_id: string;
  status: string;
  order_date: string;
  expected_delivery_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  total_amount: number | null;
  suppliers?: {
    name: string;
  };
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      sku: string;
    };
  }[];
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
}

const Orders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form states
  const [newOrder, setNewOrder] = useState({
    supplier_id: "",
    expected_delivery_date: "",
    notes: "",
    items: [] as { product_id: string; quantity: number; unit_price: number }[]
  });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          suppliers (name),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (name, sku)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("status", "active");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, unit_price")
        .eq("status", "active");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
    }
  };

  const createOrder = async () => {
    if (!user || !newOrder.supplier_id || newOrder.items.length === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = newOrder.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 
        0
      );

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          supplier_id: newOrder.supplier_id,
          user_id: user.id,
          expected_delivery_date: newOrder.expected_delivery_date || null,
          notes: newOrder.notes || null,
          total_amount: totalAmount,
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = newOrder.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Éxito",
        description: "Orden creada correctamente",
      });

      // Reset form and close dialog
      setNewOrder({
        supplier_id: "",
        expected_delivery_date: "",
        notes: "",
        items: []
      });
      setIsCreateDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "delivered") {
        updateData.delivery_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Estado de la orden actualizado",
      });

      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    }
  };

  const addOrderItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: 0 }]
    }));
  };

  const removeOrderItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary" as const;
      case "confirmed":
        return "default" as const;
      case "shipped":
        return "outline" as const;
      case "delivered":
        return "default" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "shipped":
        return "Enviada";
      case "delivered":
        return "Entregada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando órdenes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Órdenes</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Orden</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor *</Label>
                  <Select 
                    value={newOrder.supplier_id} 
                    onValueChange={(value) => setNewOrder(prev => ({ ...prev, supplier_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date">Fecha esperada de entrega</Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={newOrder.expected_delivery_date}
                    onChange={(e) => setNewOrder(prev => ({ 
                      ...prev, 
                      expected_delivery_date: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales..."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Productos *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </div>

                {newOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Producto</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => {
                          const product = products.find(p => p.id === value);
                          updateOrderItem(index, "product_id", value);
                          if (product) {
                            updateOrderItem(index, "unit_price", product.unit_price || 0);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Unitario</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total: ${(item.quantity * item.unit_price).toFixed(2)}</Label>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeOrderItem(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: ${newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createOrder}>
                    Crear Orden
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Orden</TableHead>
                <TableHead>Entrega Esperada</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.suppliers?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.order_date), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date 
                      ? format(new Date(order.expected_delivery_date), "dd/MM/yyyy", { locale: es })
                      : "N/A"
                    }
                  </TableCell>
                  <TableCell>${order.total_amount?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="confirmed">Confirmada</SelectItem>
                            <SelectItem value="shipped">Enviada</SelectItem>
                            <SelectItem value="delivered">Entregada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Proveedor</Label>
                  <p className="text-sm font-medium">{selectedOrder.suppliers?.name || "N/A"}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <Label>Fecha de Orden</Label>
                  <p className="text-sm">{format(new Date(selectedOrder.order_date), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
                <div>
                  <Label>Entrega Esperada</Label>
                  <p className="text-sm">
                    {selectedOrder.expected_delivery_date 
                      ? format(new Date(selectedOrder.expected_delivery_date), "dd/MM/yyyy", { locale: es })
                      : "N/A"
                    }
                  </p>
                </div>
                {selectedOrder.delivery_date && (
                  <div>
                    <Label>Fecha de Entrega</Label>
                    <p className="text-sm">{format(new Date(selectedOrder.delivery_date), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label>Notas</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <Label>Productos</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.order_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.products.name}</TableCell>
                        <TableCell>{item.products.sku}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell>${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: ${selectedOrder.total_amount?.toFixed(2) || "0.00"}
                </div>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;