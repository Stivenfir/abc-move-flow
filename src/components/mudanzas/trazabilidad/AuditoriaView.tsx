import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, User, Clock, Shield } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AuditoriaViewProps {
  mudanzaId: string;
}

export function AuditoriaView({ mudanzaId }: AuditoriaViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: eventos, isLoading } = useQuery({
    queryKey: ["auditoria", mudanzaId],
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

  const eventosFiltrados = eventos?.filter((evento) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      evento.descripcion.toLowerCase().includes(searchLower) ||
      evento.tipo.toLowerCase().includes(searchLower) ||
      evento.usuario_nombre?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos, usuarios, acciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventosFiltrados && eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((evento) => (
                <TableRow key={evento.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {format(new Date(evento.created_at), "dd/MM/yy HH:mm", { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">
                        {evento.usuario_nombre || "Sistema"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm line-clamp-2">{evento.descripcion}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {evento.tipo.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`text-xs ${
                        evento.categoria === 'sistema' ? 'bg-blue-500' :
                        evento.categoria === 'usuario' ? 'bg-green-500' :
                        'bg-purple-500'
                      } text-white`}
                    >
                      {evento.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(evento.datos_previos || evento.datos_nuevos) && (
                      <div className="text-xs space-y-1">
                        {evento.datos_previos && (
                          <div className="text-muted-foreground">
                            Antes: {JSON.stringify(evento.datos_previos).substring(0, 50)}...
                          </div>
                        )}
                        {evento.datos_nuevos && (
                          <div className="text-success">
                            Después: {JSON.stringify(evento.datos_nuevos).substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No se encontraron eventos" : "No hay registros de auditoría"}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {eventosFiltrados && eventosFiltrados.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {eventosFiltrados.length} de {eventos?.length} eventos
        </div>
      )}
    </div>
  );
}
