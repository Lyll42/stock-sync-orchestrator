
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Eye, Trash2, Download, AlertTriangle } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductDetails } from "@/components/products/ProductDetails";

// Tipos para los productos
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

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Datos de ejemplo
  const products: Product[] = [
    {
      id: "1",
      name: "Laptop Dell XPS 13",
      sku: "LAP001",
      category: "Electrónicos",
      currentStock: 25,
      minStock: 5,
      maxStock: 100,
      purchasePrice: 800,
      sellingPrice: 1200,
      supplier: "Dell Technologies",
      location: "A-1-01",
      isActive: true,
      lastMovement: "2024-01-15"
    },
    {
      id: "2",
      name: "Mouse Logitech MX Master",
      sku: "MOU001",
      category: "Accesorios",
      currentStock: 3,
      minStock: 10,
      maxStock: 50,
      purchasePrice: 45,
      sellingPrice: 75,
      supplier: "Logitech",
      location: "B-2-05",
      isActive: true,
      lastMovement: "2024-01-14"
    },
    {
      id: "3",
      name: "Teclado Mecánico RGB",
      sku: "TEC001",
      category: "Accesorios",
      currentStock: 15,
      minStock: 8,
      maxStock: 30,
      purchasePrice: 65,
      sellingPrice: 120,
      supplier: "Corsair",
      location: "B-1-03",
      isActive: true,
      lastMovement: "2024-01-13"
    },
    {
      id: "4",
      name: "Monitor 4K 27 pulgadas",
      sku: "MON001",
      category: "Electrónicos",
      currentStock: 8,
      minStock: 3,
      maxStock: 20,
      purchasePrice: 300,
      sellingPrice: 450,
      supplier: "Samsung",
      location: "A-3-02",
      isActive: true,
      lastMovement: "2024-01-12"
    },
    {
      id: "5",
      name: "Auriculares Sony WH-1000XM4",
      sku: "AUR001",
      category: "Accesorios",
      currentStock: 12,
      minStock: 5,
      maxStock: 25,
      purchasePrice: 200,
      sellingPrice: 350,
      supplier: "Sony",
      location: "C-1-04",
      isActive: true,
      lastMovement: "2024-01-11"
    }
  ];

  const categories = ["Todos", "Electrónicos", "Accesorios", "Oficina", "Otros"];
  const stockOptions = ["Todos", "Stock Normal", "Stock Bajo", "Sin Stock"];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "Todos" || product.category === categoryFilter;
    const matchesStock = !stockFilter || stockFilter === "Todos" ||
                        (stockFilter === "Stock Bajo" && product.currentStock <= product.minStock) ||
                        (stockFilter === "Sin Stock" && product.currentStock === 0) ||
                        (stockFilter === "Stock Normal" && product.currentStock > product.minStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (product.currentStock <= product.minStock) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock Bajo</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Productos</h1>
          <p className="text-muted-foreground">
            Administra tu catálogo de productos e inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleNewProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado Stock" />
              </SelectTrigger>
              <SelectContent>
                {stockOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {filteredProducts.length} productos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio Venta</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.currentStock <= product.minStock && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{product.currentStock}</div>
                      <div className="text-muted-foreground">Min: {product.minStock}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStockStatus(product)}</TableCell>
                  <TableCell>${product.sellingPrice.toLocaleString()}</TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? "Modifica la información del producto existente." 
                : "Agrega un nuevo producto al inventario."
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={selectedProduct} 
            onClose={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductDetails 
              product={selectedProduct} 
              onEdit={() => {
                setIsDetailsOpen(false);
                setIsFormOpen(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
