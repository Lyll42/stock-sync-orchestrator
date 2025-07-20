import { createContext, useContext, useState, useEffect } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Navigation
    dashboard: "Dashboard",
    products: "Productos", 
    movements: "Movimientos",
    suppliers: "Proveedores",
    settings: "Configuración",
    users: "Usuarios",
    logout: "Cerrar Sesión",
    
    // Dashboard
    "total-products": "Productos Totales",
    "total-value": "Valor Total",
    "low-stock": "Stock Bajo", 
    "recent-movements": "Movimientos Recientes",
    "inventory-metrics": "Métricas de Inventario",
    "product-distribution": "Distribución por Proveedor",
    "stock-predictions": "Predicciones de Stock",
    
    // Settings
    "general-settings": "Configuración General",
    "user-management": "Gestión de Usuarios",
    "system-preferences": "Preferencias del Sistema",
    "account-settings": "Configuración de Cuenta",
    "language": "Idioma",
    "spanish": "Español",
    "english": "Inglés",
    "save-changes": "Guardar Cambios",
    "cancel": "Cancelar",
    
    // Common
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "name": "Nombre",
    "email": "Email",
    "role": "Rol",
    "actions": "Acciones",
    "edit": "Editar",
    "delete": "Eliminar",
    "create": "Crear",
    "update": "Actualizar",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    products: "Products",
    movements: "Movements", 
    suppliers: "Suppliers",
    settings: "Settings",
    users: "Users",
    logout: "Logout",
    
    // Dashboard
    "total-products": "Total Products",
    "total-value": "Total Value",
    "low-stock": "Low Stock",
    "recent-movements": "Recent Movements", 
    "inventory-metrics": "Inventory Metrics",
    "product-distribution": "Distribution by Supplier",
    "stock-predictions": "Stock Predictions",
    
    // Settings
    "general-settings": "General Settings",
    "user-management": "User Management",
    "system-preferences": "System Preferences", 
    "account-settings": "Account Settings",
    "language": "Language",
    "spanish": "Spanish",
    "english": "English",
    "save-changes": "Save Changes",
    "cancel": "Cancel",
    
    // Common
    "loading": "Loading...",
    "error": "Error", 
    "success": "Success",
    "name": "Name",
    "email": "Email",
    "role": "Role",
    "actions": "Actions",
    "edit": "Edit",
    "delete": "Delete",
    "create": "Create",
    "update": "Update",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "es";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};