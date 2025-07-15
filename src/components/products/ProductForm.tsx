
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  categories: Tables<"categories">[];
}

export const ProductForm = ({ product, onClose, categories }: ProductFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category_id: "",
    unit_price: 0,
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    supplier: "",
    location: "",
    status: "active"
  });

  const suppliers = ["Dell Technologies", "Logitech", "Corsair", "Samsung", "Sony", "HP Inc.", "Apple"];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        category_id: product.category_id || "",
        unit_price: product.unit_price || 0,
        current_stock: product.current_stock,
        min_stock: product.min_stock,
        max_stock: product.max_stock || 0,
        supplier: product.supplier || "",
        location: product.location || "",
        status: product.status || "active"
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name || !formData.sku || !formData.category_id) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (product) {
        // Actualizar producto existente
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            sku: formData.sku,
            description: formData.description,
            category_id: formData.category_id,
            unit_price: formData.unit_price,
            current_stock: formData.current_stock,
            min_stock: formData.min_stock,
            max_stock: formData.max_stock,
            supplier: formData.supplier,
            location: formData.location,
            status: formData.status
          })
          .eq("id", product.id);

        if (error) throw error;
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            sku: formData.sku,
            description: formData.description,
            category_id: formData.category_id,
            unit_price: formData.unit_price,
            current_stock: formData.current_stock,
            min_stock: formData.min_stock,
            max_stock: formData.max_stock,
            supplier: formData.supplier,
            location: formData.location,
            status: formData.status
          });

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: product ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Ej: Laptop Dell XPS 13"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange("sku", e.target.value.toUpperCase())}
            placeholder="Ej: LAP001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor</Label>
          <Select value={formData.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un proveedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Precio Unitario</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_price}
            onChange={(e) => handleInputChange("unit_price", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_stock">Stock Actual</Label>
          <Input
            id="current_stock"
            type="number"
            min="0"
            value={formData.current_stock}
            onChange={(e) => handleInputChange("current_stock", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock">Stock Mínimo</Label>
          <Input
            id="min_stock"
            type="number"
            min="0"
            value={formData.min_stock}
            onChange={(e) => handleInputChange("min_stock", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_stock">Stock Máximo</Label>
          <Input
            id="max_stock"
            type="number"
            min="0"
            value={formData.max_stock}
            onChange={(e) => handleInputChange("max_stock", parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación en Almacén</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Ej: A-1-01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descripción detallada del producto..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="status"
          checked={formData.status === "active"}
          onCheckedChange={(checked) => handleInputChange("status", checked ? "active" : "inactive")}
        />
        <Label htmlFor="status">Producto Activo</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </div>
    </form>
  );
};
