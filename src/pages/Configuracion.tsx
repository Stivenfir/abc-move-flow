
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Globe, FileText, DollarSign, Plug, Shield, CheckCircle2, Circle } from "lucide-react";

const integrations = [
  {
    name: "Siigo",
    description: "Contabilidad y facturación electrónica colombiana",
    status: "configurar",
    statusLabel: "Configurar API",
  },
  {
    name: "Clientify",
    description: "CRM para gestión comercial y seguimiento de leads",
    status: "configurar",
    statusLabel: "Configurar API",
  },
  {
    name: "BUK",
    description: "Gestión de nómina y recursos humanos",
    status: "planificado",
    statusLabel: "Planificado",
  },
  {
    name: "Power Automate",
    description: "Automatización de flujos de trabajo Microsoft",
    status: "planificado",
    statusLabel: "Planificado",
  },
  {
    name: "Salesforce Legacy",
    description: "Migración de datos históricos del CRM anterior",
    status: "revision",
    statusLabel: "En revisión",
  },
  {
    name: "Power BI",
    description: "Reportes avanzados y dashboards ejecutivos",
    status: "planificado",
    statusLabel: "Planificado",
  },
];

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "activo":
      return "default";
    case "configurar":
      return "secondary";
    case "revision":
      return "outline";
    case "planificado":
    default:
      return "secondary";
  }
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "activo":
      return "bg-green-500/15 text-green-700 border-green-500/30";
    case "configurar":
      return "bg-yellow-500/15 text-yellow-700 border-yellow-500/30";
    case "revision":
      return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    case "planificado":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const roles = [
  {
    name: "Admin",
    description: "Acceso total al sistema",
    permisos: ["Todo acceso", "Gestión de usuarios", "Configuración del sistema", "Reportes globales", "Auditoría"],
  },
  {
    name: "Coordinador",
    description: "Gestión operativa de mudanzas",
    permisos: ["Crear/editar mudanzas", "Asignar agentes", "Gestión de hitos", "Documentos", "Comunicaciones"],
  },
  {
    name: "Comercial",
    description: "Ventas y cotizaciones",
    permisos: ["Crear clientes", "Generar cotizaciones", "Ver pipeline", "Reportes comerciales"],
  },
  {
    name: "Finanzas",
    description: "Control de costos e ingresos",
    permisos: ["Ver/editar costos", "Facturación", "Reportes financieros", "Estados de cuenta agentes"],
  },
  {
    name: "Agente Externo",
    description: "Acceso limitado a sus expedientes",
    permisos: ["Ver mudanzas asignadas", "Subir documentos", "Actualizar estados", "Comunicaciones"],
  },
  {
    name: "Cliente",
    description: "Portal de seguimiento",
    permisos: ["Ver su mudanza", "Tracking en tiempo real", "Descargar documentos", "Mensajes"],
  },
];

const configSections = [
  { title: "Usuarios y Roles", description: "Gestión de permisos y accesos", icon: Users },
  { title: "Catálogos", description: "Países, ciudades, tipos de servicio", icon: Globe },
  { title: "Plantillas", description: "Documentos y correos predefinidos", icon: FileText },
  { title: "Parámetros Financieros", description: "Monedas, tasas, márgenes", icon: DollarSign },
];

export default function Configuracion() {
  return (
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Parametrización y ajustes generales</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general"><Settings className="w-4 h-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="integraciones"><Plug className="w-4 h-4 mr-2" />Integraciones</TabsTrigger>
            <TabsTrigger value="roles"><Shield className="w-4 h-4 mr-2" />Roles y Permisos</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {configSections.map((section) => (
                <Card key={section.title} className="card-hover cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Módulo en construcción</h3>
                <p className="text-muted-foreground">Panel de configuración avanzado próximamente</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integraciones */}
          <TabsContent value="integraciones" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Ecosistema de Integraciones</h2>
              <p className="text-muted-foreground text-sm">Sistemas externos conectados al ERP de ABC Moving</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((item) => (
                <Card key={item.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <Badge className={statusBadgeClass(item.status)} variant="outline">
                        {item.statusLabel}
                      </Badge>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button variant="outline" size="sm" disabled className="w-full">
                            Configurar
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Próximamente</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles */}
          <TabsContent value="roles" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Roles y Permisos</h2>
              <p className="text-muted-foreground text-sm">Matriz de acceso por rol del sistema</p>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Rol</TableHead>
                      <TableHead className="w-[200px]">Descripción</TableHead>
                      <TableHead>Permisos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.name}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {role.permisos.map((p) => (
                              <span key={p} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                {p}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
