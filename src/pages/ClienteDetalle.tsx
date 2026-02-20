import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List } from "lucide-react";
import { mockClientes } from "@/lib/logisticsData";

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cliente = mockClientes.find(c => c.id === id);

  if (!cliente) {
    return (
      <div className="container-dashboard py-12 text-center">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/configuracion/clientes")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/configuracion/clientes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{cliente.razonSocial}</h1>
          <p className="text-sm text-muted-foreground">Detalle del cliente</p>
        </div>
        <Badge className={`ml-auto ${cliente.estado === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`} variant="outline">
          {cliente.estado}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información General</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">Razón Social</Label><Input value={cliente.razonSocial} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">NIT</Label><Input value={cliente.nit} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Tipo</Label><Input value={cliente.tipo} disabled className="bg-muted/50 h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Categoría</Label><Input value={cliente.categoria} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Contacto Principal</Label><Input value={cliente.contactoPrincipal} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={cliente.email} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Teléfono</Label><Input value={cliente.telefono} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Ciudad</Label><Input value={cliente.ciudad} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">País</Label><Input value={cliente.pais} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Operaciones Activas</Label><Input value={cliente.operacionesActivas} disabled className="bg-muted/50 h-9" /></div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover"><Save className="w-4 h-4 mr-2" />Actualizar</Button>
        <Button variant="outline" onClick={() => navigate("/configuracion/clientes")}><List className="w-4 h-4 mr-2" />Listado</Button>
      </div>
    </div>
  );
}
