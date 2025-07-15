
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, MapPin, Package, DollarSign, TrendingUp, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & {
  categories?: {
    name: string;
  };
};

interface ProductDetailsProps {
  product: Product;
  onEdit: () => void;
}

export const ProductDetails = ({ product, onEdit }: ProductDetailsProps) => {
  const getStockStatus = () => {
    if (product.current_stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (product.current_stock <= product.min_stock) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock Bajo</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Stock Normal</Badge>;
    }
  };

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
            <div className="text-2xl font-bold">{product.current_stock}</div>
            <p className="text-xs text-muted-foreground">
              Mín: {product.min_stock} | Máx: {product.max_stock || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Unitario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${product.unit_price?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">
              Precio por unidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${((product.unit_price || 0) * product.current_stock).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {product.current_stock} unidades × ${product.unit_price || 0}
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
              <p className="font-medium">{product.categories?.name || "Sin categoría"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Proveedor</h4>
              <p className="font-medium">{product.supplier || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Ubicación</h4>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{product.location || "N/A"}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descripción del Producto */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>
      )}

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
                  <p className="text-sm text-muted-foreground">Precio actualizado a ${product.unit_price || 0}</p>
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
