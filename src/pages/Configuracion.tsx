import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, Globe, FileText, DollarSign } from "lucide-react";

export default function Configuracion() {
  const configSections = [
    {
      title: "Usuarios y Roles",
      description: "Gestión de permisos y accesos",
      icon: Users,
    },
    {
      title: "Catálogos",
      description: "Países, ciudades, tipos de servicio",
      icon: Globe,
    },
    {
      title: "Plantillas",
      description: "Documentos y correos predefinidos",
      icon: FileText,
    },
    {
      title: "Parámetros Financieros",
      description: "Monedas, tasas, márgenes",
      icon: DollarSign,
    },
  ];

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Parametrización y ajustes generales</p>
        </div>

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
            <p className="text-muted-foreground">
              Panel de configuración avanzado próximamente
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
