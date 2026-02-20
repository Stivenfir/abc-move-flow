import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Ship, TrendingUp, DollarSign } from "lucide-react";
import { mockOperaciones } from "@/lib/logisticsData";

export default function ReportesFinancieros() {
  const impos = mockOperaciones.filter(o => o.tipoOperacion === "Importación" && !o.cancelado);
  const expos = mockOperaciones.filter(o => o.tipoOperacion === "Exportación" && !o.cancelado);
  const enTransito = mockOperaciones.filter(o => o.estado === "En Tránsito" && !o.cancelado);
  const valorImpo = impos.reduce((s, o) => s + o.valorUSD, 0);
  const valorExpo = expos.reduce((s, o) => s + o.valorUSD, 0);

  return (
    <div className="container-dashboard space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes Financieros</h1>
        <p className="text-sm text-muted-foreground">Indicadores operativos y financieros del período</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Ship className="w-4 h-4 text-info" />
              <p className="text-xs text-muted-foreground">Embarques en Tránsito</p>
            </div>
            <p className="text-2xl font-bold">{enTransito.length}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Importaciones del Mes</p>
            </div>
            <p className="text-2xl font-bold">{impos.length}</p>
            <p className="text-xs text-muted-foreground">USD ${valorImpo.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Exportaciones del Mes</p>
            </div>
            <p className="text-2xl font-bold">{expos.length}</p>
            <p className="text-xs text-muted-foreground">USD ${valorExpo.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-warning" />
              <p className="text-xs text-muted-foreground">Utilidad Acumulada</p>
            </div>
            <p className="text-2xl font-bold">USD $45,200</p>
            <p className="text-xs text-success">+12% vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Operaciones por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Ene", "Feb"].map((mes, i) => (
                <div key={mes} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{mes} 2026</span>
                    <span className="font-medium">{i === 0 ? 12 : 8} operaciones</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3 transition-all"
                      style={{ width: `${i === 0 ? 100 : 66}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ship className="w-4 h-4 text-primary" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-info/10 border border-info/20">
                <div>
                  <p className="font-medium">Importaciones</p>
                  <p className="text-sm text-muted-foreground">{impos.length} operaciones</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{Math.round(impos.length / (impos.length + expos.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">USD ${valorImpo.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div>
                  <p className="font-medium">Exportaciones</p>
                  <p className="text-sm text-muted-foreground">{expos.length} operaciones</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{Math.round(expos.length / (impos.length + expos.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">USD ${valorExpo.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
