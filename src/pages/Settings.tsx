import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  User, 
  Users, 
  Globe, 
  Shield,
  UserCheck,
  Save,
  Languages
} from "lucide-react";
import UserManagement from "./UserManagement";

const Settings = () => {
  const { user, userRole, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const handleLanguageChange = (newLanguage: "es" | "en") => {
    setLanguage(newLanguage);
    toast({
      title: t("success"),
      description: `${t("language")} ${t(newLanguage === "es" ? "spanish" : "english")}`,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive" as const;
      case "manager":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            {t("general-settings")}
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("account-settings")}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t("language")}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("user-management")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("system-preferences")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t("language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t("spanish")}</SelectItem>
                    <SelectItem value="en">{t("english")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Inventario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moneda por defecto</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                        <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Zona horaria</Label>
                    <Select defaultValue="America/Bogota">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Bogota">Bogotá (UTC-5)</SelectItem>
                        <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notificaciones</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Stock bajo</p>
                      <p className="text-sm text-muted-foreground">Notificar cuando un producto tenga stock bajo</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Movimientos</p>
                      <p className="text-sm text-muted-foreground">Notificar sobre entradas y salidas de productos</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activado
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(userRole || "user")}
                    <Badge variant={getRoleBadgeVariant(userRole || "user")}>
                      {userRole || "user"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre completo</Label>
                    <div className="p-2 border rounded bg-muted">
                      {user?.user_metadata?.full_name || "No configurado"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-2 border rounded bg-muted">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferencias</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tema oscuro</p>
                      <p className="text-sm text-muted-foreground">Cambiar entre tema claro y oscuro</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones por email</p>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones importantes por email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activado
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Configuración de Idioma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Seleccionar idioma de la aplicación</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambia el idioma de toda la interfaz de usuario
                  </p>
                </div>

                <div className="grid gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      language === "es" ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => handleLanguageChange("es")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">
                        ES
                      </div>
                      <div>
                        <p className="font-medium">Español</p>
                        <p className="text-sm text-muted-foreground">Idioma por defecto</p>
                      </div>
                      {language === "es" && (
                        <div className="ml-auto">
                          <Badge>Activo</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      language === "en" ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => handleLanguageChange("en")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                        EN
                      </div>
                      <div>
                        <p className="font-medium">English</p>
                        <p className="text-sm text-muted-foreground">English language</p>
                      </div>
                      {language === "en" && (
                        <div className="ml-auto">
                          <Badge>Active</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Nota:</strong> Los cambios de idioma se aplicarán inmediatamente en toda la aplicación.
                    Esta configuración se guardará en tu navegador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;