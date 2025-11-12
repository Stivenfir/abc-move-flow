import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventosTimeline } from "./EventosTimeline";
import { AlertasPanel } from "./AlertasPanel";
import { AuditoriaView } from "./AuditoriaView";
import { Activity, Bell, Shield } from "lucide-react";

interface TrazabilidadModuleProps {
  mudanzaId: string;
}

export function TrazabilidadModule({ mudanzaId }: TrazabilidadModuleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Trazabilidad y Auditoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="eventos">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="eventos" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventos" className="space-y-4">
            <EventosTimeline mudanzaId={mudanzaId} />
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            <AlertasPanel mudanzaId={mudanzaId} />
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4">
            <AuditoriaView mudanzaId={mudanzaId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
