import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Ship, Plane, TrendingUp, DollarSign, AlertCircle, ArrowUpRight, Package, Clock } from "lucide-react";
import { mockOperaciones, mockCotizaciones, getKPIs } from "@/lib/logisticsData";

export default function Dashboard() {
  const navigate = useNavigate();
  const kpis = getKPIs();

  const estadoColor: Record<string, string> = {
    "En Tránsito": "bg-info/10 text-info border-info/20",
    "En Puerto": "bg-warning/10 text-warning border-warning/20",
    "En Aduana": "bg-accent/10 text-accent border-accent/20",
    "Entregado": "bg-success/10 text-success border-success/20",
    "Pendiente": "bg-muted text-muted-foreground border-border",
    "Cancelado": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="container-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Operativo</h1>
          <p className="text-muted-foreground text-sm">Resumen de operaciones logísticas internacionales</p>
        </div>
        <Button onClick={() => navigate("/operaciones")} className="bg-accent hover:bg-accent-hover">
          <Ship className="w-4 h-4 mr-2" />
          Ver Operaciones
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold">{kpis.activas}</p>
            <p className="text-xs text-muted-foreground">Operaciones Activas</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Ship className="w-5 h-5 text-info" />
            </div>
            <p className="text-2xl font-bold">{kpis.enTransito}</p>
            <p className="text-xs text-muted-foreground">En Tránsito</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold">{kpis.importaciones}</p>
            <p className="text-xs text-muted-foreground">Importaciones</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Plane className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{kpis.exportaciones}</p>
            <p className="text-xs text-muted-foreground">Exportaciones</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">USD ${(kpis.valorTotal / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold">{kpis.pendientes}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Operaciones Recientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ship className="w-4 h-4 text-primary" />
              Operaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOperaciones.filter(o => o.activa).slice(0, 5).map((op) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/operaciones")}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{op.consecutivo}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {op.tipoOperacion}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{op.cliente}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {op.origen} → {op.destino}
                    </p>
                  </div>
                  <div className="text-right space-y-1 ml-3">
                    <Badge className={`text-[10px] border ${estadoColor[op.estado] || ""}`} variant="outline">
                      {op.estado}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground">
                      USD ${op.valorUSD.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cotizaciones Pendientes + Alertas */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                Cotizaciones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCotizaciones.filter(c => c.estado === "Enviada" || c.estado === "Borrador").map((cot) => (
                  <div
                    key={cot.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/cotizaciones")}
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{cot.consecutivo}</p>
                      <p className="text-xs text-muted-foreground">{cot.cliente}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={cot.estado === "Borrador" ? "secondary" : "outline"} className="text-[10px]">
                        {cot.estado}
                      </Badge>
                      <p className="text-xs font-medium">USD ${cot.valorUSD.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">2 operaciones próximas a ETA</p>
                    <p className="text-xs text-muted-foreground">OPE-2026-003, OPE-2026-006</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-info/10 border border-info/20">
                  <Clock className="w-4 h-4 text-info mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">1 cotización por vencer</p>
                    <p className="text-xs text-muted-foreground">COT-2026-002 vence en 20 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
