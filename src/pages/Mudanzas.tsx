import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { EstadoBadge } from "@/components/mudanzas/EstadoBadge";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMudanzas } from "@/hooks/useMudanzas";
import { Skeleton } from "@/components/ui/skeleton";
import { NuevaMudanzaDialog } from "@/components/mudanzas/NuevaMudanzaDialog";

export default function Mudanzas() {
  const navigate = useNavigate();
  const { data: mudanzas, isLoading } = useMudanzas();

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "bg-destructive text-destructive-foreground";
      case "alta": return "bg-warning text-warning-foreground";
      case "media": return "bg-info text-info-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="container-dashboard space-y-6">
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  return (
    <div className="container-dashboard space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Mudanzas</h1>
          <p className="text-muted-foreground">Administra todas las mudanzas activas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <NuevaMudanzaDialog />
        </div>
      </div>

      <div className="grid gap-4">
        {mudanzas?.map((mudanza) => (
          <Card 
            key={mudanza.id} 
            className="card-hover cursor-pointer"
            onClick={() => navigate(`/mudanzas/${mudanza.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{mudanza.numero}</h3>
                    <EstadoBadge estado={mudanza.estado} />
                    <Badge className={getPrioridadColor(mudanza.prioridad)}>
                      {mudanza.prioridad.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">{mudanza.cliente?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{mudanza.cliente?.tipo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Origen → Destino</p>
                      <p className="font-medium">
                        {mudanza.origen_ciudad}, {mudanza.origen_pais}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        → {mudanza.destino_ciudad}, {mudanza.destino_pais}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tipo / Modo</p>
                      <p className="font-medium capitalize">{mudanza.tipo?.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground capitalize">{mudanza.modo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Volumen:</span>{" "}
                      <span className="font-medium">{mudanza.volumen_estimado || 'N/A'} m³</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso:</span>{" "}
                      <span className="font-medium">{mudanza.peso_estimado || 'N/A'} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha estimada:</span>{" "}
                      <span className="font-medium">
                        {mudanza.fecha_estimada ? new Date(mudanza.fecha_estimada).toLocaleDateString('es-CO') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold text-primary">{mudanza.progreso}%</div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${mudanza.progreso}%` }}
                    />
                  </div>
                  {mudanza.agente && (
                    <div className="text-xs text-muted-foreground mt-4">
                      <p>Agente:</p>
                      <p className="font-medium text-foreground">{mudanza.agente.nombre}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
