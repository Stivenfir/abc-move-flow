import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { mockMudanzas } from "@/lib/mockData";
import { EstadoBadge } from "@/components/mudanzas/EstadoBadge";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Mudanzas() {
  const navigate = useNavigate();

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "bg-destructive text-destructive-foreground";
      case "alta": return "bg-warning text-warning-foreground";
      case "media": return "bg-info text-info-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
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
            <Button size="lg" className="bg-accent hover:bg-accent-hover">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Mudanza
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {mockMudanzas.map((mudanza) => (
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
                        <p className="font-medium">{mudanza.cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground">{mudanza.cliente.tipo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Origen → Destino</p>
                        <p className="font-medium">
                          {mudanza.origen.ciudad}, {mudanza.origen.pais}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          → {mudanza.destino.ciudad}, {mudanza.destino.pais}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tipo / Modo</p>
                        <p className="font-medium capitalize">{mudanza.tipo}</p>
                        <p className="text-xs text-muted-foreground capitalize">{mudanza.modo}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volumen:</span>{" "}
                        <span className="font-medium">{mudanza.volumenEstimado} m³</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Peso:</span>{" "}
                        <span className="font-medium">{mudanza.pesoEstimado} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha estimada:</span>{" "}
                        <span className="font-medium">
                          {new Date(mudanza.fechaEstimada).toLocaleDateString('es-CO')}
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
    </DashboardLayout>
  );
}
