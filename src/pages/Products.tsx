
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

// Tipos para los productos basados en Supabase
type Product = Tables<"products"> & {
  category_name?: string;
};

const Products = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);
  const [loading, setLoading] = useState(true);

  const stockOptions = ["Todos", "Stock Normal", "Stock Bajo", "Sin Stock"];

  // Cargar productos y categorías desde Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        throw categoriesError;
      }

      // Cargar productos con información de categoría
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("name");

      if (productsError) {
        throw productsError;
      }

      setCategories(categoriesData || []);
      setProducts(productsData || []);
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

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = (product as any).categories?.name || "";
    const matchesCategory = !categoryFilter || categoryFilter === "Todos" || categoryName === categoryFilter;
    const matchesStock = !stockFilter || stockFilter === "Todos" ||
                        (stockFilter === "Stock Bajo" && product.current_stock <= product.min_stock) ||
                        (stockFilter === "Sin Stock" && product.current_stock === 0) ||
                        (stockFilter === "Stock Normal" && product.current_stock > product.min_stock);
    
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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente.",
      });

      loadData(); // Recargar datos
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    loadData(); // Recargar datos cuando se cierre el formulario
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    } else if (product.current_stock <= product.min_stock) {
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
                <SelectItem value="Todos">Todos</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
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
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Cargando productos...</div>
            </div>
          ) : (
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
                        {product.current_stock <= product.min_stock && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{(product as any).categories?.name || "Sin categoría"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{product.current_stock}</div>
                        <div className="text-muted-foreground">Min: {product.min_stock}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStockStatus(product)}</TableCell>
                    <TableCell>${product.unit_price?.toLocaleString() || "0"}</TableCell>
                    <TableCell>{product.location || "-"}</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
            onClose={handleFormClose}
            categories={categories}
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
