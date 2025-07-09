
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Movements from "@/pages/Movements";
import Integrations from "@/pages/Integrations";
import Auth from "@/pages/Auth";
import UserManagement from "@/pages/UserManagement";
import { EventProvider } from "@/contexts/EventContext";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EventProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="movements" element={<Movements />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EventProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
