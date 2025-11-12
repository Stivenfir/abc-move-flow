import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, CheckCircle, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function Documentos() {
  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Control documental y cumplimiento normativo</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Documentos"
            value={0}
            icon={FileText}
          />
          <StatsCard
            title="Pendientes"
            value={0}
            icon={Clock}
          />
          <StatsCard
            title="Aprobados"
            value={0}
            icon={CheckCircle}
          />
          <StatsCard
            title="Este Mes"
            value={0}
            icon={Upload}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Módulo en construcción</h3>
              <p className="text-muted-foreground">
                Sistema de gestión documental con OCR próximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
