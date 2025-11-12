import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Edit, Trash2, QrCode, Image } from "lucide-react";
import { toast } from "sonner";

interface PackingListProps {
  mudanzaId: string;
}

export function PackingList({ mudanzaId }: PackingListProps) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["inventario", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getCondicionColor = (condicion: string) => {
    const colors = {
      excelente: "bg-success text-white",
      buena: "bg-blue-500 text-white",
      regular: "bg-amber-500 text-white",
      dañado: "bg-destructive text-white",
    };
    return colors[condicion as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const downloadQR = async (qrData: string, itemId: string) => {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(qrData, { width: 500 });
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${itemId}.png`;
      link.click();
      toast.success("Código QR descargado");
    } catch (error) {
      toast.error("Error al descargar QR");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay items registrados</h3>
        <p className="text-muted-foreground">
          Comienza agregando items al inventario
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Items Registrados</h3>
          <p className="text-sm text-muted-foreground">
            Total: {items.length} items | Volumen: {items.reduce((acc, item) => acc + (item.volumen || 0), 0).toFixed(2)} m³
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Item Icon/Photo */}
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {item.fotos && item.fotos.length > 0 ? (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="font-semibold text-base">{item.descripcion}</h4>
                      <p className="text-sm text-muted-foreground">{item.habitacion}</p>
                    </div>
                    <Badge className={getCondicionColor(item.condicion)}>
                      {item.condicion}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cantidad</p>
                      <p className="font-medium">{item.cantidad}</p>
                    </div>
                    {item.volumen && (
                      <div>
                        <p className="text-muted-foreground">Volumen</p>
                        <p className="font-medium">{item.volumen} m³</p>
                      </div>
                    )}
                    {item.peso && (
                      <div>
                        <p className="text-muted-foreground">Peso</p>
                        <p className="font-medium">{item.peso} kg</p>
                      </div>
                    )}
                    {item.valor_declarado && (
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-medium">${item.valor_declarado}</p>
                      </div>
                    )}
                  </div>

                  {item.embalaje && (
                    <div className="mt-2">
                      <Badge variant="outline">{item.embalaje}</Badge>
                    </div>
                  )}

                  {item.notas && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.notas}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => item.codigo_qr && downloadQR(item.codigo_qr, item.id)}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
