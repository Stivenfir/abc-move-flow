import { Home, Ship, FileText, Settings, DollarSign, ChevronDown, Briefcase, ClipboardList, TrendingUp, Receipt, FileBox } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Operaciones", icon: Ship, url: "/operaciones" },
];

const comercialSubItems = [
  { title: "Solicitudes de Servicio", url: "/comercial/solicitudes" },
  { title: "Seguimiento Comercial", url: "/comercial/seguimiento" },
  { title: "Tarifas Repecev", url: "/comercial/tarifas" },
];

const documentacionSubItems = [
  { title: "Instrucciones de Embarque", url: "/documentacion/instrucciones" },
  { title: "Gestión de BL", url: "/documentacion/bl" },
];

const cotizacionItems = [
  { title: "Cotizaciones", icon: FileText, url: "/cotizaciones" },
];

const configSubItems = [
  { title: "Usuarios por Rol", url: "/configuracion/usuarios" },
  { title: "Empleados", url: "/configuracion/empleados" },
  { title: "Clientes", url: "/configuracion/clientes" },
  { title: "Proveedores", url: "/configuracion/proveedores" },
  { title: "Tablas Básicas", url: "/configuracion/tablas" },
];

const finanzasSubItems = [
  { title: "Facturación", url: "/finanzas/facturacion" },
  { title: "Pagos a Terceros", url: "/finanzas/pagos" },
  { title: "Reportes", url: "/finanzas/reportes" },
];

export function DashboardSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  const isComercialActive = comercialSubItems.some(item => isActive(item.url));
  const isDocumentacionActive = documentacionSubItems.some(item => isActive(item.url));
  const isConfigActive = configSubItems.some(item => isActive(item.url));
  const isFinanzasActive = finanzasSubItems.some(item => isActive(item.url));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Ship className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sidebar-foreground">ABC Cargo Logistic</h2>
            <p className="text-[11px] text-sidebar-foreground/60">ERP Logística Internacional</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Comercial - Collapsible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isComercialActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isComercialActive}>
                      <Briefcase className="w-4 h-4" />
                      <span>Comercial</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {comercialSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Cotización */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {cotizacionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Documentación - Collapsible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isDocumentacionActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isDocumentacionActive}>
                      <FileBox className="w-4 h-4" />
                      <span>Documentación</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {documentacionSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuración - Collapsible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isConfigActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isConfigActive}>
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {configSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Finanzas - Collapsible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isFinanzasActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isFinanzasActive}>
                      <DollarSign className="w-4 h-4" />
                      <span>Finanzas</span>
                      <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {finanzasSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url}>{item.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-medium text-sidebar-primary-foreground">
            MT
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Miguel Torres</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Administrador</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
