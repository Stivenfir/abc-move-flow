import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Operaciones from "./pages/Operaciones";
import Cotizaciones from "./pages/Cotizaciones";
import ConfigUsuarios from "./pages/ConfigUsuarios";
import ConfigClientes from "./pages/ConfigClientes";
import ConfigTablas from "./pages/ConfigTablas";
import Facturacion from "./pages/Facturacion";
import Pagos from "./pages/Pagos";
import ReportesFinancieros from "./pages/ReportesFinancieros";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/operaciones" element={<Operaciones />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/configuracion/usuarios" element={<ConfigUsuarios />} />
            <Route path="/configuracion/clientes" element={<ConfigClientes />} />
            <Route path="/configuracion/proveedores" element={<ConfigClientes />} />
            <Route path="/configuracion/tablas" element={<ConfigTablas />} />
            <Route path="/finanzas/facturacion" element={<Facturacion />} />
            <Route path="/finanzas/pagos" element={<Pagos />} />
            <Route path="/finanzas/reportes" element={<ReportesFinancieros />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
