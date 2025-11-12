import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Bodega() {
  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Bodega</h1>
          <p className="text-muted-foreground">Control de almacenamiento y guarda muebles</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Espacios Ocupados"
            value={0}
            icon={Warehouse}
          />
          <StatsCard
            title="m³ Totales"
            value="0"
            icon={Package}
          />
          <StatsCard
            title="Ocupación"
            value="0%"
            icon={TrendingUp}
          />
          <StatsCard
            title="Alertas"
            value={0}
            icon={AlertCircle}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bodega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Warehouse className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Módulo en construcción</h3>
              <p className="text-muted-foreground">
                Sistema de gestión de bodega y almacenamiento próximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
