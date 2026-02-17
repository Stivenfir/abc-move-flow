import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, QrCode, FileText, CheckCircle2, Sofa, CookingPot, BedDouble, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PackingListProps {
  mudanzaId: string;
}

const HABITACION_ICONS: Record<string, typeof Sofa> = {
  "Sala": Sofa,
  "Cocina": CookingPot,
  "Dormitorio Principal": BedDouble,
  "Estudio": BookOpen,
};

function parseMeta(notas: string | null) {
  const fragilidad = notas?.match(/Fragilidad:\s*(alta|media|baja)/i)?.[1]?.toLowerCase() || "baja";
  const marca = notas?.match(/Marca:\s*([^.]+)/)?.[1]?.trim() || "";
  const modelo = notas?.match(/Modelo:\s*([^.]+)/)?.[1]?.trim() || "";
  return { fragilidad, marca, modelo };
}

function FragilidadBadge({ nivel }: { nivel: string }) {
  const map: Record<string, string> = {
    alta: "bg-red-500/15 text-red-700 border-red-200",
    media: "bg-amber-500/15 text-amber-700 border-amber-200",
    baja: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  };
  return <Badge className={map[nivel] || map.baja}>{nivel}</Badge>;
}

function EstadoItemBadge({ ubicacion }: { ubicacion: string | null }) {
  if (!ubicacion) return <Badge variant="outline">Pendiente</Badge>;
  // Infer state from ubicacion_bodega presence
  return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200">Almacenado</Badge>;
}

export function PackingList({ mudanzaId }: PackingListProps) {
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(["Sala", "Cocina", "Dormitorio Principal", "Estudio"]));
  const [clienteAprobado, setClienteAprobado] = useState(false);
  const [fechaAprobacion, setFechaAprobacion] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["inventario", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("habitacion", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const grouped = useMemo(() => {
    if (!items) return {};
    const g: Record<string, typeof items> = {};
    items.forEach(i => {
      const room = i.habitacion || "Otros";
      if (!g[room]) g[room] = [];
      g[room].push(i);
    });
    return g;
  }, [items]);

  const toggleRoom = (room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      next.has(room) ? next.delete(room) : next.add(room);
      return next;
    });
  };

  const handleAprobacion = () => {
    setClienteAprobado(true);
    setFechaAprobacion(new Date().toISOString());
    toast.success("Inventario aprobado por el cliente");
  };

  const generatePDF = () => {
    if (!items || items.length === 0) {
      toast.error("No hay items en el inventario");
      return;
    }
    try {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("PACKING LIST — INVENTARIO", pw / 2, y, { align: "center" });
      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, pw / 2, y, { align: "center" });
      y += 12;

      const totalVol = items.reduce((s, i) => s + Number(i.volumen || 0), 0);
      const totalPeso = items.reduce((s, i) => s + Number(i.peso || 0), 0);
      const totalValor = items.reduce((s, i) => s + Number(i.valor_declarado || 0), 0);

      doc.setFontSize(10);
      doc.text(`Items: ${items.length}  |  Vol: ${totalVol.toFixed(1)} m³  |  Peso: ${totalPeso.toFixed(1)} kg  |  Valor: $${totalValor.toLocaleString()} USD`, 20, y);
      y += 12;

      Object.entries(grouped).forEach(([room, roomItems]) => {
        if (y > 260) { doc.addPage(); y = 20; }

        doc.setFillColor(240, 240, 240);
        doc.rect(20, y - 4, pw - 40, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`${room} (${roomItems.length})`, 22, y + 1);
        y += 10;

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("#", 22, y);
        doc.text("Descripción", 30, y);
        doc.text("Cond.", 100, y);
        doc.text("m³", 120, y);
        doc.text("kg", 135, y);
        doc.text("USD", 148, y);
        doc.text("Fragil.", 168, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        roomItems.forEach((item, idx) => {
          if (y > 275) { doc.addPage(); y = 20; }
          const meta = parseMeta(item.notas);
          doc.text(`${idx + 1}`, 22, y);
          doc.text(item.descripcion.substring(0, 35), 30, y);
          doc.text(item.condicion, 100, y);
          doc.text(`${Number(item.volumen || 0).toFixed(1)}`, 120, y);
          doc.text(`${Number(item.peso || 0).toFixed(0)}`, 135, y);
          doc.text(`$${Number(item.valor_declarado || 0).toLocaleString()}`, 148, y);
          doc.text(meta.fragilidad, 168, y);
          y += 5;
        });
        y += 5;
      });

      if (clienteAprobado && fechaAprobacion) {
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text(`✓ Cliente aprobó inventario: ${format(new Date(fechaAprobacion), "dd/MM/yyyy HH:mm")}`, 20, y);
      }

      doc.save(`Packing-List-${mudanzaId.substring(0, 8)}.pdf`);
      toast.success("Packing List PDF generado");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar PDF");
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No hay items registrados</h3>
        <p className="text-muted-foreground">Comienza agregando items al inventario</p>
      </div>
    );
  }

  const totalVol = items.reduce((s, i) => s + Number(i.volumen || 0), 0);
  const totalPeso = items.reduce((s, i) => s + Number(i.peso || 0), 0);
  const totalValor = items.reduce((s, i) => s + Number(i.valor_declarado || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="text-xl font-bold">{items.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">Volumen</p>
          <p className="text-xl font-bold">{totalVol.toFixed(1)} m³</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">Peso</p>
          <p className="text-xl font-bold">{totalPeso.toFixed(0)} kg</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border text-center">
          <p className="text-xs text-muted-foreground">Valor Total</p>
          <p className="text-xl font-bold">${totalValor.toLocaleString()}</p>
        </div>
      </div>

      {/* Grouped by Room */}
      {Object.entries(grouped).map(([room, roomItems]) => {
        const RoomIcon = HABITACION_ICONS[room] || Package;
        const isExpanded = expandedRooms.has(room);
        return (
          <Card key={room}>
            <CardHeader
              className="cursor-pointer py-3 px-4"
              onClick={() => toggleRoom(room)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <RoomIcon className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">{room}</CardTitle>
                  <Badge variant="outline" className="text-xs">{roomItems.length} items</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {roomItems.reduce((s, i) => s + Number(i.volumen || 0), 0).toFixed(1)} m³ · ${roomItems.reduce((s, i) => s + Number(i.valor_declarado || 0), 0).toLocaleString()}
                </span>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0 px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Marca/Modelo</TableHead>
                      <TableHead>Condición</TableHead>
                      <TableHead className="text-right">USD</TableHead>
                      <TableHead className="text-right">m³</TableHead>
                      <TableHead className="text-right">kg</TableHead>
                      <TableHead>Fragilidad</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomItems.map(item => {
                      const meta = parseMeta(item.notas);
                      const condColor: Record<string, string> = {
                        excelente: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
                        buena: "bg-blue-500/15 text-blue-700 border-blue-200",
                        regular: "bg-amber-500/15 text-amber-700 border-amber-200",
                        "dañado": "bg-red-500/15 text-red-700 border-red-200",
                      };
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.descripcion}</p>
                              {item.embalaje && <p className="text-xs text-muted-foreground">{item.embalaje}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {meta.marca && <span>{meta.marca}</span>}
                            {meta.modelo && <span className="text-muted-foreground"> {meta.modelo}</span>}
                            {!meta.marca && !meta.modelo && "—"}
                          </TableCell>
                          <TableCell><Badge className={condColor[item.condicion] || ""}>{item.condicion}</Badge></TableCell>
                          <TableCell className="text-right font-mono">${Number(item.valor_declarado || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">{Number(item.volumen || 0).toFixed(1)}</TableCell>
                          <TableCell className="text-right font-mono">{Number(item.peso || 0).toFixed(0)}</TableCell>
                          <TableCell><FragilidadBadge nivel={meta.fragilidad} /></TableCell>
                          <TableCell><EstadoItemBadge ubicacion={item.ubicacion_bodega} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Approval + PDF */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="aprobacion"
              checked={clienteAprobado}
              onCheckedChange={() => !clienteAprobado && handleAprobacion()}
              disabled={clienteAprobado}
            />
            <label htmlFor="aprobacion" className="text-sm font-medium cursor-pointer">
              Cliente aprobó inventario
            </label>
            {clienteAprobado && fechaAprobacion && (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {format(new Date(fechaAprobacion), "dd/MM/yyyy HH:mm")}
              </Badge>
            )}
          </div>

          <Button onClick={generatePDF} className="w-full" size="lg">
            <FileText className="w-4 h-4 mr-2" />
            Generar Packing List PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
