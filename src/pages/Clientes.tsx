import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Building2, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Clientes() {
  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-dashboard space-y-6">
          <Skeleton className="h-20 w-full" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </DashboardLayout>
    );
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "corporativo": return Building2;
      case "diplomatico": return Building2;
      default: return User;
    }
  };

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes y contactos</p>
          </div>
          <Button size="lg" className="bg-accent hover:bg-accent-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientes?.map((cliente) => {
            const IconComponent = getTipoIcon(cliente.tipo);
            return (
              <Card key={cliente.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{cliente.nombre}</h3>
                      <Badge className="capitalize mt-1">{cliente.tipo}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {cliente.empresa && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{cliente.empresa}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.ciudad && cliente.pais && (
                      <p className="text-xs text-muted-foreground">
                        {cliente.ciudad}, {cliente.pais}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!clientes || clientes.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay clientes registrados</h3>
                <p className="text-muted-foreground mb-4">
                  Agrega tu primer cliente para comenzar
                </p>
                <Button className="bg-accent hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Cliente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
