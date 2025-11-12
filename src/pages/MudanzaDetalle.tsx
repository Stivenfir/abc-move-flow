import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { useMudanza } from "@/hooks/useMudanzas";
import { EstadoBadge } from "@/components/mudanzas/EstadoBadge";
import { TimelineHito } from "@/components/mudanzas/TimelineHito";
import { SLAAlerts } from "@/components/mudanzas/SLAAlerts";
import { MudanzaStats } from "@/components/mudanzas/MudanzaStats";
import { 
  ArrowLeft, User, MapPin, Package, 
  FileText, MessageSquare 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const estadosTimeline = [
  { estado: "inspeccion", label: "Inspección" },
  { estado: "cotizacion", label: "Cotización" },
  { estado: "booking", label: "Booking" },
  { estado: "empaque", label: "Empaque" },
  { estado: "bodega", label: "Bodega" },
  { estado: "despacho", label: "Despacho" },
  { estado: "transito", label: "Tránsito" },
  { estado: "aduana", label: "Aduana" },
  { estado: "entrega", label: "Entrega" },
  { estado: "cerrado", label: "Cerrado" },
];

export default function MudanzaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: mudanza, isLoading } = useMudanza(id!);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-dashboard space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!mudanza) {
    return (
      <DashboardLayout>
        <div className="container-dashboard">
          <p>Mudanza no encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  const getEstadoIndex = (estado: string) => estadosTimeline.findIndex(e => e.estado === estado);
  const estadoActualIndex = getEstadoIndex(mudanza.estado);

  // Mapear hitos existentes o crear estructura básica
  const hitos = mudanza.hitos && mudanza.hitos.length > 0 
    ? mudanza.hitos 
    : estadosTimeline.map((et, index) => ({
        id: `temp-${index}`,
        estado: et.estado,
        fecha_plan: undefined,
        fecha_real: undefined,
        completado: index < estadoActualIndex,
        sla_dias: 7, // Default SLA
        responsable: undefined,
        comentarios: undefined,
        documentos: []
      }));

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
              <Badge variant="outline" className="capitalize">
                {mudanza.prioridad}
              </Badge>
            </div>
            <p className="text-muted-foreground">{mudanza.cliente.nombre}</p>
          </div>
          <Button className="bg-accent hover:bg-accent-hover">
            Actualizar Estado
          </Button>
        </div>

        {/* KPI Stats */}
        <MudanzaStats 
          hitos={hitos}
          fechaCreacion={mudanza.fecha_creacion}
          fechaEstimada={mudanza.fecha_estimada}
        />

        {/* Alertas SLA */}
        <SLAAlerts hitos={hitos} estadoActual={mudanza.estado} />

        {/* Timeline Mejorado */}
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo Operativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-2">
                {estadosTimeline.map((item, index) => {
                  const completado = index < estadoActualIndex;
                  const actual = index === estadoActualIndex;
                  const pendiente = index > estadoActualIndex;
                  
                  const hitoData = hitos.find(h => h.estado === item.estado) || {
                    id: `temp-${index}`,
                    estado: item.estado,
                    fecha_plan: undefined,
                    fecha_real: undefined,
                    completado,
                    sla_dias: 7,
                    responsable: undefined,
                    comentarios: undefined,
                    documentos: []
                  };
                  
                  return (
                    <TimelineHito
                      key={item.estado}
                      hito={hitoData}
                      estadoLabel={item.label}
                      isActual={actual}
                      isCompletado={completado}
                      isPendiente={pendiente}
                    />
                  );
                })}
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
                <p className="font-medium">{mudanza.cliente?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{mudanza.cliente?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{mudanza.cliente?.telefono || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Cliente</p>
                <Badge className="capitalize">{mudanza.cliente?.tipo}</Badge>
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
                <p className="font-medium capitalize">{mudanza.tipo?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modo de Transporte</p>
                <p className="font-medium capitalize">{mudanza.modo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volumen Estimado</p>
                <p className="font-medium">{mudanza.volumen_estimado || 'N/A'} m³</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Estimado</p>
                <p className="font-medium">{mudanza.peso_estimado || 'N/A'} kg</p>
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
              <p className="font-medium">{mudanza.origen_ciudad}, {mudanza.origen_pais}</p>
              <p className="text-sm text-muted-foreground">{mudanza.origen_direccion || 'N/A'}</p>
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
              <p className="font-medium">{mudanza.destino_ciudad}, {mudanza.destino_pais}</p>
              <p className="text-sm text-muted-foreground">{mudanza.destino_direccion || 'N/A'}</p>
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
