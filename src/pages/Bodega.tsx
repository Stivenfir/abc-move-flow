import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Package, Warehouse, TrendingUp, AlertCircle, QrCode, Clock, MapPin, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const PASILLOS = ["A", "B", "C", "D"];
const RACKS = [1, 2, 3, 4, 5];
const CELDAS = [1, 2, 3];

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function Bodega() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const { data: items } = useQuery({
    queryKey: ["bodega-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("*, mudanza:mudanzas(numero, cliente:clientes(nombre))")
        .not("ubicacion_bodega", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Parse grid occupancy
  const occupiedCells = new Set(items?.map(i => i.ubicacion_bodega).filter(Boolean));
  const totalCells = PASILLOS.length * RACKS.length * CELDAS.length;
  const occupiedCount = occupiedCells.size;
  const occupancyPct = totalCells > 0 ? Math.round((occupiedCount / totalCells) * 100) : 0;
  const totalM3 = items?.reduce((s, i) => s + Number(i.volumen || 0), 0) || 0;
  const alertItems = items?.filter(i => daysSince(i.created_at) > 90) || [];

  const cellItem = (pasillo: string, rack: number, celda: number) => {
    const loc = `${pasillo}${rack}-R${rack}-C${celda}`;
    return items?.find(i => i.ubicacion_bodega === loc);
  };

  const getCellColor = (pasillo: string, rack: number, celda: number) => {
    const loc = `${pasillo}${rack}-R${rack}-C${celda}`;
    // Simplified: match any item whose ubicacion_bodega starts with the pasillo letter and contains the rack
    const item = items?.find(i => i.ubicacion_bodega === `${pasillo}${rack}-R${rack}-C${celda}`) ||
                 items?.find(i => i.ubicacion_bodega === `${pasillo}${rack - rack + 1}-R${rack}-C${celda}`);
    // Better match: just check if the cell key exists in any item
    const matchedItem = items?.find(i => {
      const ub = i.ubicacion_bodega || "";
      // format: A1-R2-C1 means pasillo A, rack 2, celda 1
      const parts = ub.match(/^([A-D])(\d+)-R(\d+)-C(\d+)$/);
      if (!parts) return false;
      return parts[1] === pasillo && parseInt(parts[3]) === rack && parseInt(parts[4]) === celda;
    });
    if (!matchedItem) return "bg-muted/50 border-dashed";
    if (daysSince(matchedItem.created_at) > 90) return "bg-red-500/20 border-red-300";
    if (daysSince(matchedItem.created_at) > 60) return "bg-amber-500/20 border-amber-300";
    return "bg-emerald-500/20 border-emerald-300";
  };

  const getItemForCell = (pasillo: string, rack: number, celda: number) => {
    return items?.find(i => {
      const parts = (i.ubicacion_bodega || "").match(/^([A-D])\d+-R(\d+)-C(\d+)$/);
      if (!parts) return false;
      return parts[1] === pasillo && parseInt(parts[2]) === rack && parseInt(parts[3]) === celda;
    });
  };

  return (
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Bodega</h1>
          <p className="text-muted-foreground">Control de almacenamiento y guarda muebles</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Espacios Ocupados" value={`${occupiedCount}/${totalCells}`} icon={Warehouse} />
          <StatsCard title="m³ Almacenados" value={`${totalM3.toFixed(1)} m³`} icon={Package} />
          <StatsCard title="Ocupación" value={`${occupancyPct}%`} icon={TrendingUp} />
          <StatsCard title="Alertas +90 días" value={alertItems.length} icon={AlertCircle} />
        </div>

        {/* Occupancy Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Ocupación General</span>
              <span className="text-sm text-muted-foreground">{occupiedCount} de {totalCells} celdas</span>
            </div>
            <Progress value={occupancyPct} className="h-3" />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/40" /> &lt;60 días</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40" /> 60-90 días</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40" /> &gt;90 días</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-dashed bg-muted/50" /> Vacío</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="grid">
          <TabsList>
            <TabsTrigger value="grid">Mapa de Bodega</TabsTrigger>
            <TabsTrigger value="lista">Lista de Bultos</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="zonafranca">Zona Franca</TabsTrigger>
          </TabsList>

          {/* Grid Visual */}
          <TabsContent value="grid">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> Mapa Visual de Espacios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {PASILLOS.map(pasillo => (
                    <div key={pasillo}>
                      <h4 className="font-semibold text-sm mb-2">Pasillo {pasillo}</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {RACKS.map(rack => (
                          <div key={rack} className="space-y-1">
                            <p className="text-xs text-muted-foreground text-center">Rack {rack}</p>
                            <div className="space-y-1">
                              {CELDAS.map(celda => {
                                const item = getItemForCell(pasillo, rack, celda);
                                const cellKey = `${pasillo}-R${rack}-C${celda}`;
                                return (
                                  <div
                                    key={celda}
                                    onClick={() => setSelectedCell(selectedCell === cellKey ? null : cellKey)}
                                    className={cn(
                                      "border rounded p-2 text-xs cursor-pointer transition-all hover:ring-2 hover:ring-primary/30",
                                      getCellColor(pasillo, rack, celda),
                                      selectedCell === cellKey && "ring-2 ring-primary"
                                    )}
                                  >
                                    <div className="font-mono text-[10px] text-muted-foreground">C{celda}</div>
                                    {item ? (
                                      <div className="truncate font-medium mt-0.5" title={item.descripcion}>
                                        {item.descripcion?.substring(0, 18)}
                                      </div>
                                    ) : (
                                      <div className="text-muted-foreground/50 mt-0.5">Vacío</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Selected cell detail */}
                {selectedCell && (() => {
                  const parts = selectedCell.match(/^([A-D])-R(\d+)-C(\d+)$/);
                  if (!parts) return null;
                  const item = getItemForCell(parts[1], parseInt(parts[2]), parseInt(parts[3]));
                  if (!item) return <p className="mt-4 text-sm text-muted-foreground">Celda vacía</p>;
                  return (
                    <Card className="mt-4">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><p className="text-muted-foreground">Descripción</p><p className="font-medium">{item.descripcion}</p></div>
                          <div><p className="text-muted-foreground">Cliente</p><p className="font-medium">{(item as any).mudanza?.cliente?.nombre}</p></div>
                          <div><p className="text-muted-foreground">Mudanza</p><p className="font-medium font-mono">{(item as any).mudanza?.numero}</p></div>
                          <div><p className="text-muted-foreground">Días</p><p className="font-medium">{daysSince(item.created_at)} días</p></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista de Bultos */}
          <TabsContent value="lista">
            <Card>
              <CardHeader><CardTitle className="text-base">Bultos Almacenados</CardTitle></CardHeader>
              <CardContent>
                {items && items.length > 0 ? (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>QR</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Mudanza</TableHead>
                          <TableHead>Habitación</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Entrada</TableHead>
                          <TableHead>Días</TableHead>
                          <TableHead className="text-right">Tarifa/día</TableHead>
                          <TableHead>Ubicación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => {
                          const dias = daysSince(item.created_at);
                          return (
                            <TableRow key={item.id} className={dias > 90 ? "bg-red-500/5" : ""}>
                              <TableCell><Badge variant="outline" className="font-mono text-xs"><QrCode className="w-3 h-3 mr-1" />{item.codigo_qr?.substring(0, 10)}</Badge></TableCell>
                              <TableCell>{(item as any).mudanza?.cliente?.nombre || "—"}</TableCell>
                              <TableCell className="font-mono text-xs">{(item as any).mudanza?.numero || "—"}</TableCell>
                              <TableCell>{item.habitacion}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{item.descripcion}</TableCell>
                              <TableCell className="text-sm">{new Date(item.created_at).toLocaleDateString("es")}</TableCell>
                              <TableCell>
                                <Badge variant={dias > 90 ? "destructive" : dias > 60 ? "secondary" : "outline"}>
                                  {dias}d
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">${((Number(item.volumen || 0.5) * 2.5)).toFixed(0)}</TableCell>
                              <TableCell className="font-mono text-xs">{item.ubicacion_bodega || "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay bultos almacenados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Ítems con más de 90 días</CardTitle>
                <CardDescription>Estos ítems requieren revisión o retiro</CardDescription>
              </CardHeader>
              <CardContent>
                {alertItems.length > 0 ? (
                  <div className="space-y-3">
                    {alertItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-red-200 bg-red-500/5">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.descripcion}</p>
                          <p className="text-sm text-muted-foreground">{(item as any).mudanza?.cliente?.nombre} — {(item as any).mudanza?.numero}</p>
                        </div>
                        <Badge variant="destructive">{daysSince(item.created_at)} días</Badge>
                        <span className="text-sm font-mono">{item.ubicacion_bodega}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay ítems con más de 90 días</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zona Franca */}
          <TabsContent value="zonafranca">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zona Franca — Tiempos Máximos</CardTitle>
                <CardDescription>Control de permanencia según regulación de zona franca</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Tiempo máximo legal</p>
                    <p className="text-2xl font-bold">12 meses</p>
                    <p className="text-xs text-muted-foreground mt-1">Resolución DIAN 72/2016</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Alerta temprana</p>
                    <p className="text-2xl font-bold">9 meses</p>
                    <p className="text-xs text-muted-foreground mt-1">Notificación automática al cliente</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground">Ítems en zona franca</p>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Sin ítems actualmente</p>
                  </div>
                </div>
                <div className="text-center py-6">
                  <Warehouse className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay ítems en zona franca actualmente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
