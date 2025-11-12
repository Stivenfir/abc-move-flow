import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { mockMudanzas } from "@/lib/mockData";
import { EstadoBadge } from "@/components/mudanzas/EstadoBadge";
import { 
  ArrowLeft, User, MapPin, Package, Calendar, DollarSign, 
  FileText, MessageSquare, CheckCircle2 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const estadosTimeline = [
  { estado: "inspeccion", label: "Inspección", completado: true },
  { estado: "cotizacion", label: "Cotización", completado: true },
  { estado: "booking", label: "Booking", completado: true },
  { estado: "empaque", label: "Empaque", completado: true },
  { estado: "bodega", label: "Bodega", completado: true },
  { estado: "despacho", label: "Despacho", completado: true },
  { estado: "transito", label: "Tránsito", completado: true },
  { estado: "aduana", label: "Aduana", completado: false },
  { estado: "entrega", label: "Entrega", completado: false },
  { estado: "cerrado", label: "Cerrado", completado: false },
];

export default function MudanzaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mudanza = mockMudanzas.find(m => m.id === id);

  if (!mudanza) {
    return <div>Mudanza no encontrada</div>;
  }

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mudanzas")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{mudanza.numero}</h1>
              <EstadoBadge estado={mudanza.estado} />
            </div>
            <p className="text-muted-foreground">{mudanza.cliente.nombre}</p>
          </div>
          <Button className="bg-accent hover:bg-accent-hover">
            Actualizar Estado
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progreso de la mudanza</span>
                <span className="text-muted-foreground">{mudanza.progreso}%</span>
              </div>
              <Progress value={mudanza.progreso} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {estadosTimeline.map((item, index) => (
                  <div key={item.estado} className="relative flex items-start gap-4 pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                      item.completado 
                        ? 'bg-success border-success' 
                        : mudanza.estado === item.estado
                        ? 'bg-primary border-primary animate-pulse'
                        : 'bg-background border-border'
                    }`}>
                      {item.completado && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${
                          item.completado || mudanza.estado === item.estado
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                          {item.label}
                        </p>
                        {item.completado && (
                          <span className="text-xs text-muted-foreground">
                            Completado
                          </span>
                        )}
                        {mudanza.estado === item.estado && (
                          <Badge className="bg-primary">En Proceso</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{mudanza.cliente.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mudanza.cliente.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{mudanza.cliente.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Cliente</p>
                <Badge className="capitalize">{mudanza.cliente.tipo}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de la Mudanza */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Detalles de la Mudanza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium capitalize">{mudanza.tipo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modo de Transporte</p>
                <p className="font-medium capitalize">{mudanza.modo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumen Estimado</p>
                <p className="font-medium">{mudanza.volumenEstimado} m³</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Estimado</p>
                <p className="font-medium">{mudanza.pesoEstimado} kg</p>
              </div>
            </CardContent>
          </Card>

          {/* Origen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Origen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{mudanza.origen.ciudad}, {mudanza.origen.pais}</p>
              <p className="text-sm text-muted-foreground">{mudanza.origen.direccion}</p>
            </CardContent>
          </Card>

          {/* Destino */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Destino
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{mudanza.destino.ciudad}, {mudanza.destino.pais}</p>
              <p className="text-sm text-muted-foreground">{mudanza.destino.direccion}</p>
            </CardContent>
          </Card>
        </div>

        {mudanza.agente && (
          <Card>
            <CardHeader>
              <CardTitle>Agente Internacional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">{mudanza.agente.nombre}</p>
                  <p className="text-muted-foreground">{mudanza.agente.ciudad}, {mudanza.agente.pais}</p>
                </div>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
