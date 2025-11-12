import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Reportes() {
  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">KPIs operativos, comerciales y financieros</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Ingresos del Mes"
            value="$0"
            icon={DollarSign}
          />
          <StatsCard
            title="Mudanzas Completadas"
            value={0}
            icon={Package}
          />
          <StatsCard
            title="Tasa de Conversión"
            value="0%"
            icon={TrendingUp}
          />
          <StatsCard
            title="Margen Promedio"
            value="0%"
            icon={BarChart3}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Módulo en construcción</h3>
              <p className="text-muted-foreground">
                Dashboards de análisis y reportes avanzados próximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
