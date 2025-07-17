-- Crear tabla de proveedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  website TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Authenticated users can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create suppliers" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers" 
ON public.suppliers 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete suppliers" 
ON public.suppliers 
FOR DELETE 
USING (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Actualizar tabla de productos para referenciar suppliers
ALTER TABLE public.products 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Migrar datos existentes de supplier texto a supplier_id
-- Crear proveedores únicos basados en el campo supplier existente
INSERT INTO public.suppliers (name, status)
SELECT DISTINCT supplier, 'active'
FROM public.products 
WHERE supplier IS NOT NULL AND supplier != '';

-- Actualizar products para usar supplier_id
UPDATE public.products 
SET supplier_id = s.id 
FROM public.suppliers s 
WHERE products.supplier = s.name;

-- Opcional: remover la columna supplier antigua después de verificar
-- ALTER TABLE public.products DROP COLUMN supplier;