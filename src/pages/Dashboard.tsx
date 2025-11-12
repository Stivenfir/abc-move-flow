import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/mudanzas/EstadoBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMudanzas } from "@/hooks/useMudanzas";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: mudanzas, isLoading } = useMudanzas();
  
  const mudanzasActivas = mudanzas?.filter(m => m.estado !== "cerrado").length || 0;
  const mudanzasEnTransito = mudanzas?.filter(m => m.estado === "transito").length || 0;
  const mudanzasUrgentes = mudanzas?.filter(m => m.prioridad === "urgente").length || 0;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-dashboard space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Operativo</h1>
            <p className="text-muted-foreground">Resumen de mudanzas y operaciones</p>
          </div>
          <Button onClick={() => navigate("/mudanzas")} size="lg" className="bg-accent hover:bg-accent-hover">
            Ver Todas las Mudanzas
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Mudanzas Activas"
            value={mudanzasActivas}
            change={{ value: "+12%", trend: "up" }}
            icon={Package}
          />
          <StatsCard
            title="En Tránsito"
            value={mudanzasEnTransito}
            icon={TrendingUp}
          />
          <StatsCard
            title="Urgentes"
            value={mudanzasUrgentes}
            icon={AlertCircle}
            className="border-destructive/20"
          />
          <StatsCard
            title="Completadas Este Mes"
            value={8}
            change={{ value: "+8%", trend: "up" }}
            icon={CheckCircle}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Mudanzas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mudanzas?.slice(0, 3).map((mudanza) => (
                  <div
                    key={mudanza.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/mudanzas/${mudanza.id}`)}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{mudanza.numero}</p>
                      <p className="text-sm text-muted-foreground">{mudanza.cliente?.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {mudanza.origen_ciudad} → {mudanza.destino_ciudad}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <EstadoBadge estado={mudanza.estado} />
                      <p className="text-xs text-muted-foreground">
                        Est: {mudanza.fecha_estimada ? new Date(mudanza.fecha_estimada).toLocaleDateString('es-CO') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-accent" />
                Alertas y Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Documento pendiente</p>
                    <p className="text-xs text-muted-foreground">Algunas mudanzas requieren documentación</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-info/10 border border-info/20">
                  <Clock className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Inspección programada</p>
                    <p className="text-xs text-muted-foreground">Verifica el calendario de inspecciones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Sistema operativo</p>
                    <p className="text-xs text-muted-foreground">Todas las mudanzas están siendo rastreadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
