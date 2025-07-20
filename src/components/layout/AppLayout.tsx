
import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Package, 
  ArrowRightLeft, 
  Truck, 
  ShoppingCart,
  Menu, 
  Bell, 
  Settings, 
  User,
  ChevronDown,
  LogOut
} from "lucide-react";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, isAdmin, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
      description: "Panel principal"
    },
    {
      name: "Productos",
      href: "/products",
      icon: Package,
      description: "Gestión de inventario"
    },
    {
      name: "Movimientos",
      href: "/movements",
      icon: ArrowRightLeft,
      description: "Entradas y salidas"
    },
    {
      name: "Proveedores",
      href: "/suppliers",
      icon: Truck,
      description: "Gestión de proveedores"
    },
    {
      name: "Órdenes",
      href: "/orders",
      icon: ShoppingCart,
      description: "Gestión de órdenes"
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      description: "Configuración del sistema"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getNavLinkClass = (path: string) => {
    return cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive(path)
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Package className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">StockSync</h1>
          <p className="text-xs text-muted-foreground">Gestión de Inventario</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={getNavLinkClass(item.href)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
              {isActive(item.href) && (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</div>
                <div className="text-xs text-muted-foreground">{userRole || "Usuario"}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center gap-x-4 border-b px-4 py-3 shadow-sm sm:gap-x-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="bg-card h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">StockSync</h1>
          </div>
          
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
            <Badge className="ml-1 h-5 w-5 p-0 text-xs">3</Badge>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar for desktop */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:border-b lg:px-6 lg:py-4">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
              <Badge className="ml-1 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted cursor-pointer">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
