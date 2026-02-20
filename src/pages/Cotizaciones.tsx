import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Search, Download } from "lucide-react";
import { mockCotizaciones } from "@/lib/logisticsData";

const estadoColor: Record<string, string> = {
  "Borrador": "bg-muted text-muted-foreground",
  "Enviada": "bg-info/10 text-info border-info/20",
  "Aprobada": "bg-success/10 text-success border-success/20",
  "Rechazada": "bg-destructive/10 text-destructive border-destructive/20",
  "Vencida": "bg-warning/10 text-warning border-warning/20",
};

export default function Cotizaciones() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const filtradas = useMemo(() => {
    return mockCotizaciones.filter((c) => {
      const matchBusqueda = !busqueda ||
        c.consecutivo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.cliente.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [busqueda, filtroEstado]);

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">Gestión de tarifas y cotizaciones</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por consecutivo o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Enviada">Enviada</SelectItem>
                <SelectItem value="Aprobada">Aprobada</SelectItem>
                <SelectItem value="Rechazada">Rechazada</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consecutivo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Mercancía</TableHead>
                <TableHead className="text-right">Valor USD</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Comercial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((cot) => (
                <TableRow key={cot.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{cot.consecutivo}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{cot.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{cot.tipoOperacion}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{cot.modoTransporte}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {cot.origen} → {cot.destino}
                  </TableCell>
                  <TableCell className="text-xs">{cot.tipoMercancia}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ${cot.valorUSD.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${estadoColor[cot.estado] || ""}`} variant="outline">
                      {cot.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(cot.fechaVencimiento).toLocaleDateString("es-CO")}
                  </TableCell>
                  <TableCell className="text-xs">{cot.comercial}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Mostrando {filtradas.length} de {mockCotizaciones.length} registros
      </p>
    </div>
  );
}
