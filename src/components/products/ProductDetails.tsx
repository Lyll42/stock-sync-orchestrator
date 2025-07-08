
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, MapPin, Package, DollarSign, TrendingUp, Calendar } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  isActive: boolean;
  lastMovement: string;
}

interface ProductDetailsProps {
  product: Product;
  onEdit: () => void;
}

export const ProductDetails = ({ product, onEdit }: ProductDetailsProps) => {
  const getStockStatus = () => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock Bajo</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Stock Normal</Badge>;
    }
  };

  const profitMargin = ((product.sellingPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStockStatus()}
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.currentStock}</div>
            <p className="text-xs text-muted-foreground">
              Mín: {product.minStock} | Máx: {product.maxStock}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio de Venta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${product.sellingPrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Compra: ${product.purchasePrice.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              ${(product.sellingPrice - product.purchasePrice).toLocaleString()} por unidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalles del Producto */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Categoría</h4>
              <p className="font-medium">{product.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Proveedor</h4>
              <p className="font-medium">{product.supplier}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Ubicación</h4>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{product.location}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valor de Inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Valor de Inventario</CardTitle>
          <CardDescription>Cálculos basados en stock actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Valor de Compra Total</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(product.currentStock * product.purchasePrice).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Valor de Venta Total</p>
              <p className="text-2xl font-bold text-green-600">
                ${(product.currentStock * product.sellingPrice).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ganancia Potencial</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(product.currentStock * (product.sellingPrice - product.purchasePrice)).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos movimientos de este producto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium">Entrada de inventario</p>
                  <p className="text-sm text-muted-foreground">+25 unidades agregadas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">15/01/2024</p>
                <p className="text-xs text-muted-foreground">Juan Pérez</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div>
                  <p className="font-medium">Venta</p>
                  <p className="text-sm text-muted-foreground">-3 unidades vendidas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">14/01/2024</p>
                <p className="text-xs text-muted-foreground">Sistema</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium">Ajuste de precio</p>
                  <p className="text-sm text-muted-foreground">Precio actualizado a ${product.sellingPrice}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">12/01/2024</p>
                <p className="text-xs text-muted-foreground">Ana García</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
