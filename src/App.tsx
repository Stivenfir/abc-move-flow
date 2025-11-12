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
import AgenteDetalle from "./pages/AgenteDetalle";
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/mudanzas" element={<Mudanzas />} />
            <Route path="/mudanzas/:id" element={<MudanzaDetalle />} />
            <Route path="/agentes" element={<Agentes />} />
            <Route path="/agentes/:id" element={<AgenteDetalle />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/bodega" element={<Bodega />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
