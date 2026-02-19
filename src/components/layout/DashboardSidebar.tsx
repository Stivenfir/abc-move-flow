import { Home, Package, Users, Globe, FileText, Settings, BarChart3, Warehouse, DollarSign, UserCircle, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Mudanzas", icon: Package, url: "/mudanzas" },
  { title: "Agentes", icon: Globe, url: "/agentes" },
  { title: "Clientes", icon: Users, url: "/clientes" },
  { title: "Aduanas", icon: Shield, url: "/aduanas" },
  { title: "Bodega", icon: Warehouse, url: "/bodega" },
  { title: "Documentos", icon: FileText, url: "/documentos" },
];

const reportItems = [
  { title: "Reportes", icon: BarChart3, url: "/reportes" },
  { title: "Finanzas", icon: DollarSign, url: "/finanzas" },
];

const configItems = [
  { title: "Portal Cliente", icon: UserCircle, url: "/portal-cliente" },
  { title: "Configuración", icon: Settings, url: "/configuracion" },
];

export function DashboardSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  const renderMenuItems = (items: typeof menuItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <Link to={item.url} className="flex items-center gap-3">
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-sidebar-foreground">ABC Moving</h2>
            <p className="text-xs text-sidebar-foreground/60">ERP Mudanzas</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(menuItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Análisis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(reportItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(configItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-medium text-sidebar-primary-foreground">
            CD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Coordinador Demo
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              Modo desarrollo
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}