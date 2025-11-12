import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Mudanzas from "./pages/Mudanzas";
import MudanzaDetalle from "./pages/MudanzaDetalle";
import Agentes from "./pages/Agentes";
import Clientes from "./pages/Clientes";
import Bodega from "./pages/Bodega";
import Documentos from "./pages/Documentos";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mudanzas"
              element={
                <ProtectedRoute>
                  <Mudanzas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mudanzas/:id"
              element={
                <ProtectedRoute>
                  <MudanzaDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agentes"
              element={
                <ProtectedRoute>
                  <Agentes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bodega"
              element={
                <ProtectedRoute>
                  <Bodega />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentos"
              element={
                <ProtectedRoute>
                  <Documentos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute>
                  <Configuracion />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
