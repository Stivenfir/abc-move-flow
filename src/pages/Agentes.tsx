import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Star, TrendingUp, MapPin, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Agentes() {
  const { data: agentes, isLoading } = useQuery({
    queryKey: ["agentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agentes")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-dashboard space-y-6">
          <Skeleton className="h-20 w-full" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agentes Internacionales</h1>
            <p className="text-muted-foreground">Red global de partners certificados</p>
          </div>
          <Button size="lg" className="bg-accent hover:bg-accent-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Agente
          </Button>
        </div>

        <div className="grid gap-4">
          {agentes?.map((agente) => (
            <Card key={agente.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{agente.nombre}</h3>
                        <p className="text-muted-foreground">{agente.ciudad}, {agente.pais}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Contacto</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">{agente.contacto_email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{agente.contacto_telefono || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Cobertura</p>
                        <div className="flex flex-wrap gap-1">
                          {agente.cobertura?.slice(0, 3).map((pais, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {pais}
                            </Badge>
                          ))}
                          {(agente.cobertura?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(agente.cobertura?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Certificaciones</p>
                        <div className="flex flex-wrap gap-1">
                          {agente.certificaciones?.map((cert, i) => (
                            <Badge key={i} className="text-xs bg-success/10 text-success border-success/20">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium">{agente.rating || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mudanzas:</span>{" "}
                        <span className="font-medium">{agente.mudanzas_completadas || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cumplimiento:</span>{" "}
                        <span className="font-medium text-success">{agente.tasa_cumplimiento || 0}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SLA:</span>{" "}
                        <span className="font-medium">{agente.sla_dias || 0} días</span>
                      </div>
                    </div>
                  </div>

                  <Badge 
                    className={agente.activo 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-muted text-muted-foreground"
                    }
                  >
                    {agente.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!agentes || agentes.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay agentes registrados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando agentes internacionales a tu red
                </p>
                <Button className="bg-accent hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Agente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
