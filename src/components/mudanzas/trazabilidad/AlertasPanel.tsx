import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle, 
  Clock, X 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AlertasPanelProps {
  mudanzaId: string;
}

export function AlertasPanel({ mudanzaId }: AlertasPanelProps) {
  const queryClient = useQueryClient();

  const { data: alertas, isLoading } = useQuery({
    queryKey: ["alertas", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const resolverAlerta = useMutation({
    mutationFn: async (alertaId: string) => {
      const { error } = await supabase
        .from("alertas")
        .update({ 
          resuelta: true, 
          resuelta_at: new Date().toISOString() 
        })
        .eq("id", alertaId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerta resuelta");
      queryClient.invalidateQueries({ queryKey: ["alertas", mudanzaId] });
    },
    onError: () => {
      toast.error("Error al resolver alerta");
    },
  });

  const getSeveridadConfig = (severidad: string) => {
    const configs = {
      critical: {
        icon: AlertCircle,
        color: "bg-destructive text-white",
        borderColor: "border-destructive",
        bgColor: "bg-destructive/10",
      },
      error: {
        icon: AlertCircle,
        color: "bg-red-500 text-white",
        borderColor: "border-red-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
      },
      warning: {
        icon: AlertTriangle,
        color: "bg-amber-500 text-white",
        borderColor: "border-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
      },
      info: {
        icon: Info,
        color: "bg-blue-500 text-white",
        borderColor: "border-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
      },
    };
    return configs[severidad as keyof typeof configs] || configs.info;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!alertas || alertas.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
        <h3 className="text-lg font-semibold mb-2">No hay alertas activas</h3>
        <p className="text-muted-foreground">
          Todo está funcionando correctamente
        </p>
      </div>
    );
  }

  const alertasActivas = alertas.filter(a => !a.resuelta);
  const alertasResueltas = alertas.filter(a => a.resuelta);

  return (
    <div className="space-y-6">
      {/* Alertas Activas */}
      {alertasActivas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Alertas Activas ({alertasActivas.length})
          </h3>
          <div className="space-y-3">
            {alertasActivas.map((alerta) => {
              const config = getSeveridadConfig(alerta.severidad);
              const Icon = config.icon;

              return (
                <Card key={alerta.id} className={cn("border-2", config.borderColor)}>
                  <CardContent className={cn("p-4", config.bgColor)}>
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-lg", config.color)}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold">{alerta.titulo}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alerta.mensaje}
                            </p>
                          </div>
                          <Badge className={config.color}>
                            {alerta.severidad}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(alerta.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolverAlerta.mutate(alerta.id)}
                            disabled={resolverAlerta.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas Resueltas */}
      {alertasResueltas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
            Resueltas ({alertasResueltas.length})
          </h3>
          <div className="space-y-2">
            {alertasResueltas.slice(0, 5).map((alerta) => (
              <Card key={alerta.id} className="opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <div>
                        <p className="text-sm font-medium">{alerta.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          Resuelta {alerta.resuelta_at && format(new Date(alerta.resuelta_at), "dd MMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
