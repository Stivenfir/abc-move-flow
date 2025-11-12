import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface DocumentListProps {
  mudanzaId: string;
}

export function DocumentList({ mudanzaId }: DocumentListProps) {
  const queryClient = useQueryClient();

  const { data: documentos, isLoading } = useQuery({
    queryKey: ["documentos", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteDoc = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("documentos")
        .delete()
        .eq("id", docId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Documento eliminado");
      queryClient.invalidateQueries({ queryKey: ["documentos", mudanzaId] });
    },
    onError: (error) => {
      toast.error("Error al eliminar documento");
      console.error(error);
    },
  });

  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: "bg-amber-500 text-white",
      aprobado: "bg-success text-white",
      rechazado: "bg-destructive text-white",
      enviado: "bg-blue-500 text-white",
    };
    return colors[estado as keyof typeof colors] || "bg-gray-500 text-white";
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

  if (!documentos || documentos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
        <p className="text-muted-foreground">
          Genera documentos desde la pestaña "Generar"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documentos.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-semibold">{doc.nombre}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {doc.tipo}
                    </p>
                  </div>
                  <Badge className={getEstadoColor(doc.estado)}>
                    {doc.estado}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {format(new Date(doc.fecha_subida), "dd MMM yyyy", { locale: es })}
                  </span>
                  {doc.notas && (
                    <span className="line-clamp-1">{doc.notas}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, "_blank")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = doc.url;
                    link.download = doc.nombre;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteDoc.mutate(doc.id)}
                  disabled={deleteDoc.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
