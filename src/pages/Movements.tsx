
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, Calendar as CalendarIcon, ArrowUp, ArrowDown, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Movement {
  id: string;
  productName: string;
  productSku: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference: string;
  responsible: string;
  notes: string;
  date: Date;
  newStock: number;
}

const Movements = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Estado del formulario
  const [formData, setFormData] = useState({
    productSku: "",
    type: "",
    quantity: 0,
    unitCost: 0,
    reference: "",
    notes: "",
    date: new Date()
  });

  // Productos disponibles (simulado)
  const availableProducts = [
    { sku: "LAP001", name: "Laptop Dell XPS 13", currentStock: 25 },
    { sku: "MOU001", name: "Mouse Logitech MX Master", currentStock: 3 },
    { sku: "TEC001", name: "Teclado Mecánico RGB", currentStock: 15 },
    { sku: "MON001", name: "Monitor 4K 27 pulgadas", currentStock: 8 },
    { sku: "AUR001", name: "Auriculares Sony WH-1000XM4", currentStock: 12 }
  ];

  // Movimientos de ejemplo
  const movements: Movement[] = [
    {
      id: "1",
      productName: "Laptop Dell XPS 13",
      productSku: "LAP001",
      type: "IN",
      quantity: 50,
      unitCost: 800,
      totalCost: 40000,
      reference: "PO-2024-001",
      responsible: "Juan Pérez",
      notes: "Compra mensual de laptops",
      date: new Date("2024-01-15"),
      newStock: 75
    },
    {
      id: "2",
      productName: "Mouse Logitech MX Master",
      productSku: "MOU001",
      type: "OUT",
      quantity: -3,
      reference: "SALE-2024-156",
      responsible: "Sistema",
      notes: "Venta automática desde e-commerce",
      date: new Date("2024-01-14"),
      newStock: 3
    },
    {
      id: "3",
      productName: "Teclado Mecánico RGB",
      productSku: "TEC001",
      type: "ADJUSTMENT",
      quantity: -2,
      reference: "ADJ-2024-005",
      responsible: "Ana García",
      notes: "Ajuste por diferencia física",
      date: new Date("2024-01-13"),
      newStock: 15
    },
    {
      id: "4",
      productName: "Monitor 4K 27 pulgadas",
      productSku: "MON001",
      type: "IN",
      quantity: 10,
      unitCost: 300,
      totalCost: 3000,
      reference: "PO-2024-002",
      responsible: "Carlos López",
      notes: "Reposición de monitores",
      date: new Date("2024-01-12"),
      newStock: 18
    },
    {
      id: "5",
      productName: "Auriculares Sony WH-1000XM4",
      productSku: "AUR001",
      type: "OUT",
      quantity: -5,
      reference: "SALE-2024-158",
      responsible: "Sistema",
      notes: "Venta mayorista",
      date: new Date("2024-01-11"),
      newStock: 12
    }
  ];

  const movementTypes = [
    { value: "IN", label: "Entrada", icon: ArrowUp, color: "text-green-600" },
    { value: "OUT", label: "Salida", icon: ArrowDown, color: "text-red-600" },
    { value: "ADJUSTMENT", label: "Ajuste", icon: RefreshCw, color: "text-blue-600" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productSku || !formData.type || formData.quantity === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    // Simular guardado
    console.log("Guardando movimiento:", formData);
    
    toast({
      title: "Éxito",
      description: "Movimiento registrado correctamente. El stock se ha actualizado.",
    });

    // Resetear formulario
    setFormData({
      productSku: "",
      type: "",
      quantity: 0,
      unitCost: 0,
      reference: "",
      notes: "",
      date: new Date()
    });
    
    setIsFormOpen(false);
  };

  const getMovementBadge = (type: Movement["type"]) => {
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
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || typeFilter === "all" || movement.type === typeFilter;
    const matchesDateFrom = !dateFrom || movement.date >= dateFrom;
    const matchesDateTo = !dateTo || movement.date <= dateTo;
    
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const selectedProduct = availableProducts.find(p => p.sku === formData.productSku);

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

      {/* Historial de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            {filteredMovements.length} movimientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Nuevo Stock</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(movement.date, "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movement.productName}</div>
                      <div className="text-sm text-muted-foreground">{movement.productSku}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getMovementBadge(movement.type)}</TableCell>
                  <TableCell>{getQuantityDisplay(movement)}</TableCell>
                  <TableCell className="font-medium">{movement.newStock}</TableCell>
                  <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                  <TableCell>{movement.responsible}</TableCell>
                  <TableCell>
                    {movement.totalCost ? `$${movement.totalCost.toLocaleString()}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                  value={formData.productSku} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, productSku: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(product => (
                      <SelectItem key={product.sku} value={product.sku}>
                        {product.name} ({product.sku}) - Stock: {product.currentStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Stock actual: {selectedProduct.currentStock} unidades
                  </p>
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
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="Ingresa la cantidad"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.type === "OUT" ? "Cantidad a restar (usar número positivo)" : 
                   formData.type === "IN" ? "Cantidad a agregar" : 
                   "Cantidad de ajuste (positivo o negativo)"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitCost">Costo Unitario</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    unitCost: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0.00"
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

              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal w-full"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.date, "dd/MM/yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
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

            {formData.quantity !== 0 && formData.unitCost > 0 && (
              <Card className="p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Costo Total:</span>
                  <span className="text-lg font-bold">
                    ${(Math.abs(formData.quantity) * formData.unitCost).toLocaleString()}
                  </span>
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Movimiento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;
