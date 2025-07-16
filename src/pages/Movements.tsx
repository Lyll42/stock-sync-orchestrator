import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Calendar as CalendarIcon, ArrowUp, ArrowDown, RefreshCw, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Movement = Tables<"movements"> & {
  products?: Pick<Product, 'name' | 'sku'>;
};

const Movements = () => {
  const { toast } = useToast();
  const { addEvent } = useEvents();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para datos de Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    productId: "",
    type: "",
    quantity: 0,
    reference: "",
    notes: "",
    reason: ""
  });

  // Cargar productos y movimientos al inicializar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar productos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (productsError) throw productsError;
      
      // Cargar movimientos con información del producto
      const { data: movementsData, error: movementsError } = await supabase
        .from("movements")
        .select(`
          *,
          products (name, sku)
        `)
        .order("created_at", { ascending: false });

      if (movementsError) throw movementsError;
      
      setProducts(productsData || []);
      setMovements(movementsData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const movementTypes = [
    { value: "entry", label: "Entrada", icon: ArrowUp, color: "text-green-600" },
    { value: "exit", label: "Salida", icon: ArrowDown, color: "text-red-600" },
    { value: "adjustment", label: "Ajuste", icon: RefreshCw, color: "text-blue-600" }
  ];

  const calculateNewStock = (currentStock: number, quantity: number, type: string): number => {
    switch (type) {
      case "entry":
        return currentStock + Math.abs(quantity);
      case "exit":
        return currentStock - Math.abs(quantity);
      case "adjustment":
        return currentStock + quantity; // Permite números negativos para ajustes
      default:
        return currentStock;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.type || formData.quantity === 0 || !user) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const selectedProduct = products.find(p => p.id === formData.productId);
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Producto no encontrado.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Calcular el nuevo stock basado en el tipo de movimiento
      const adjustedQuantity = formData.type === "exit" ? Math.abs(formData.quantity) : formData.quantity;
      const newStock = calculateNewStock(selectedProduct.current_stock, adjustedQuantity, formData.type);

      // Validar que no haya stock negativo para salidas
      if (newStock < 0 && formData.type === "exit") {
        toast({
          title: "Error",
          description: `Stock insuficiente. Stock actual: ${selectedProduct.current_stock}, cantidad solicitada: ${Math.abs(formData.quantity)}`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Determinar la cantidad real del movimiento (con signo correcto)
      let movementQuantity: number;
      switch (formData.type) {
        case "entry":
          movementQuantity = Math.abs(formData.quantity);
          break;
        case "exit":
          movementQuantity = -Math.abs(formData.quantity);
          break;
        case "adjustment":
          movementQuantity = formData.quantity;
          break;
        default:
          movementQuantity = formData.quantity;
      }

      // Iniciar transacción - crear movimiento y actualizar stock
      const { error: movementError } = await supabase
        .from("movements")
        .insert({
          product_id: formData.productId,
          movement_type: formData.type,
          quantity: movementQuantity,
          previous_stock: selectedProduct.current_stock,
          new_stock: newStock,
          reference_number: formData.reference || null,
          reason: formData.reason || null,
          notes: formData.notes || null,
          user_id: user.id
        });

      if (movementError) throw movementError;

      // Actualizar el stock del producto
      const { error: productError } = await supabase
        .from("products")
        .update({ current_stock: newStock })
        .eq("id", formData.productId);

      if (productError) throw productError;

      // Agregar evento al sistema de notificaciones
      addEvent({
        type: 'movement_registered',
        title: 'Movimiento Registrado',
        message: `${formData.type === "entry" ? "Entrada" : formData.type === "exit" ? "Salida" : "Ajuste"} de ${Math.abs(movementQuantity)} unidades de ${selectedProduct.name}`,
        severity: 'success',
        source: 'inventory',
        data: {
          productSku: selectedProduct.sku,
          productName: selectedProduct.name,
          type: formData.type,
          quantity: movementQuantity,
          newStock,
          reference: formData.reference
        }
      });

      // Verificar si el stock está bajo después del movimiento
      if (newStock <= selectedProduct.min_stock && formData.type === "exit") {
        addEvent({
          type: 'stock_alert',
          title: 'Alerta de Stock Bajo',
          message: `${selectedProduct.name} tiene stock bajo (${newStock} unidades). Mínimo requerido: ${selectedProduct.min_stock}`,
          severity: 'warning',
          source: 'inventory',
          data: {
            productSku: selectedProduct.sku,
            productName: selectedProduct.name,
            currentStock: newStock,
            minStock: selectedProduct.min_stock
          }
        });
      }
      
      toast({
        title: "Éxito",
        description: `Movimiento registrado correctamente. Stock actualizado: ${newStock} unidades.`,
      });

      // Resetear formulario
      setFormData({
        productId: "",
        type: "",
        quantity: 0,
        reference: "",
        notes: "",
        reason: ""
      });
      
      setIsFormOpen(false);
      
      // Recargar datos
      loadData();
    } catch (error) {
      console.error("Error guardando movimiento:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getMovementBadge = (type: string) => {
    const config = movementTypes.find(t => t.value === type);
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getQuantityDisplay = (movement: Movement) => {
    const isPositive = movement.quantity > 0;
    return (
      <span className={cn(
        "font-medium",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isPositive ? "+" : ""}{movement.quantity}
      </span>
    );
  };

  // Filtrar movimientos
  const filteredMovements = movements.filter(movement => {
    const productName = movement.products?.name || "";
    const productSku = movement.products?.sku || "";
    const reference = movement.reference_number || "";
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || typeFilter === "all" || movement.movement_type === typeFilter;
    const matchesDateFrom = !dateFrom || new Date(movement.created_at) >= dateFrom;
    const matchesDateTo = !dateTo || new Date(movement.created_at) <= dateTo;
    
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const previewNewStock = selectedProduct && formData.quantity !== 0 ? 
    calculateNewStock(selectedProduct.current_stock, formData.quantity, formData.type) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">
            Registra y consulta entradas, salidas y ajustes de inventario
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Producto, SKU o referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {movementTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Nuevo Movimiento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
            <DialogDescription>
              Registra una entrada, salida o ajuste de inventario
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Producto *</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku}) - Stock: {product.current_stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Stock actual: <span className="font-medium">{selectedProduct.current_stock}</span> unidades
                    </p>
                    {selectedProduct.current_stock <= selectedProduct.min_stock && (
                      <p className="text-orange-600 font-medium">
                        ⚠️ Stock bajo (mínimo: {selectedProduct.min_stock})
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Movimiento *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="Ingresa la cantidad"
                />
                <div className="text-xs space-y-1">
                  {formData.type === "exit" && (
                    <p className="text-red-600">
                      Se restará {Math.abs(formData.quantity)} del stock actual
                    </p>
                  )}
                  {formData.type === "entry" && (
                    <p className="text-green-600">
                      Se agregará {Math.abs(formData.quantity)} al stock actual
                    </p>
                  )}
                  {formData.type === "adjustment" && (
                    <p className="text-blue-600">
                      Ajuste: {formData.quantity > 0 ? "+" : ""}{formData.quantity} unidades
                    </p>
                  )}
                </div>
              </div>

              {/* Preview del nuevo stock */}
              {previewNewStock !== null && selectedProduct && (
                <div className="space-y-2">
                  <Label>Nuevo Stock (Preview)</Label>
                  <div className={cn(
                    "p-3 rounded-md border text-center font-medium",
                    previewNewStock < 0 ? "bg-red-50 border-red-200 text-red-800" :
                    previewNewStock <= selectedProduct.min_stock ? "bg-orange-50 border-orange-200 text-orange-800" :
                    "bg-green-50 border-green-200 text-green-800"
                  )}>
                    {previewNewStock} unidades
                    {previewNewStock < 0 && <div className="text-xs">❌ Stock insuficiente</div>}
                    {previewNewStock <= selectedProduct.min_stock && previewNewStock >= 0 && (
                      <div className="text-xs">⚠️ Stock bajo</div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Razón</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ej: Compra, Venta, Devolución"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Ej: PO-2024-001, SALE-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional sobre este movimiento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={submitting || (previewNewStock !== null && previewNewStock < 0)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Movimiento"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Historial de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            {filteredMovements.length} movimientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando movimientos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Stock Anterior</TableHead>
                  <TableHead>Nuevo Stock</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron movimientos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.created_at), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{movement.products?.name || "Producto eliminado"}</div>
                          <div className="text-sm text-muted-foreground">{movement.products?.sku || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getMovementBadge(movement.movement_type)}</TableCell>
                      <TableCell>{getQuantityDisplay(movement)}</TableCell>
                      <TableCell className="font-medium">{movement.previous_stock}</TableCell>
                      <TableCell className="font-medium">{movement.new_stock}</TableCell>
                      <TableCell className="font-mono text-sm">{movement.reference_number || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{movement.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Movements;