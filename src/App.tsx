import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Operaciones from "./pages/Operaciones";
import OperacionDetalle from "./pages/OperacionDetalle";
import Cotizaciones from "./pages/Cotizaciones";
import CotizacionDetalle from "./pages/CotizacionDetalle";
import Solicitudes from "./pages/Solicitudes";
import SolicitudDetalle from "./pages/SolicitudDetalle";
import Seguimiento from "./pages/Seguimiento";
import Tarifas from "./pages/Tarifas";
import ConfigUsuarios from "./pages/ConfigUsuarios";
import ConfigEmpleados from "./pages/ConfigEmpleados";
import ConfigClientes from "./pages/ConfigClientes";
import ClienteDetalle from "./pages/ClienteDetalle";
import ConfigTablas from "./pages/ConfigTablas";
import Facturacion from "./pages/Facturacion";
import FacturaDetalle from "./pages/FacturaDetalle";
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
            <Route path="/operaciones/:id" element={<OperacionDetalle />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/cotizaciones/:id" element={<CotizacionDetalle />} />
            <Route path="/comercial/solicitudes" element={<Solicitudes />} />
            <Route path="/comercial/solicitudes/:id" element={<SolicitudDetalle />} />
            <Route path="/comercial/seguimiento" element={<Seguimiento />} />
            <Route path="/comercial/tarifas" element={<Tarifas />} />
            <Route path="/configuracion/usuarios" element={<ConfigUsuarios />} />
            <Route path="/configuracion/empleados" element={<ConfigEmpleados />} />
            <Route path="/configuracion/clientes" element={<ConfigClientes />} />
            <Route path="/configuracion/clientes/:id" element={<ClienteDetalle />} />
            <Route path="/configuracion/proveedores" element={<ConfigClientes />} />
            <Route path="/configuracion/tablas" element={<ConfigTablas />} />
            <Route path="/finanzas/facturacion" element={<Facturacion />} />
            <Route path="/finanzas/facturacion/:id" element={<FacturaDetalle />} />
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
