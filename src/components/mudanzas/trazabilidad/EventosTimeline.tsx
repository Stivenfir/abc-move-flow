import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, FileText, AlertCircle, MessageSquare, 
  User, Clock, CheckCircle, Package 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventosTimelineProps {
  mudanzaId: string;
}

export function EventosTimeline({ mudanzaId }: EventosTimelineProps) {
  const { data: eventos, isLoading } = useQuery({
    queryKey: ["eventos", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mudanza_eventos")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getEventIcon = (tipo: string) => {
    const icons = {
      estado_cambio: ArrowRight,
      documento_generado: FileText,
      hito_completado: CheckCircle,
      comunicacion: MessageSquare,
      alerta: AlertCircle,
      nota: MessageSquare,
      prioridad_cambio: AlertCircle,
      agente_asignado: User,
      inventario_agregado: Package,
    };
    return icons[tipo as keyof typeof icons] || Clock;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      sistema: "bg-blue-500",
      usuario: "bg-green-500",
      automatico: "bg-purple-500",
    };
    return colors[categoria as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay eventos registrados</h3>
        <p className="text-muted-foreground">
          Los eventos se registrarán automáticamente conforme ocurran
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        {eventos.map((evento) => {
          const Icon = getEventIcon(evento.tipo);
          
          return (
            <Card key={evento.id} className="relative ml-14 mb-3">
              <div 
                className={`absolute -left-14 top-4 w-12 h-12 rounded-full ${getCategoriaColor(evento.categoria)} 
                  flex items-center justify-center shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{evento.descripcion}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(evento.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </span>
                      {evento.usuario_nombre && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {evento.usuario_nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {evento.tipo.replace('_', ' ')}
                  </Badge>
                </div>

                {(evento.datos_previos || evento.datos_nuevos) && (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    {evento.datos_previos && (
                      <div className="mb-2">
                        <span className="font-medium text-muted-foreground">Anterior: </span>
                        <code className="text-xs">
                          {JSON.stringify(evento.datos_previos, null, 2)}
                        </code>
                      </div>
                    )}
                    {evento.datos_nuevos && (
                      <div>
                        <span className="font-medium text-muted-foreground">Nuevo: </span>
                        <code className="text-xs">
                          {JSON.stringify(evento.datos_nuevos, null, 2)}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
