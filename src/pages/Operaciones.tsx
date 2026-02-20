import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ship, Plus, Search, Download, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockOperaciones, type Operacion } from "@/lib/logisticsData";

const estadoColor: Record<string, string> = {
  "En Tránsito": "bg-info/10 text-info border-info/20",
  "En Puerto": "bg-warning/10 text-warning border-warning/20",
  "En Aduana": "bg-accent/10 text-accent border-accent/20",
  "Entregado": "bg-success/10 text-success border-success/20",
  "Pendiente": "bg-muted text-muted-foreground border-border",
  "Cancelado": "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Operaciones() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroModo, setFiltroModo] = useState<string>("todos");
  const [porPagina, setPorPagina] = useState(10);
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    return mockOperaciones.filter((op) => {
      const matchBusqueda =
        !busqueda ||
        op.consecutivo.toLowerCase().includes(busqueda.toLowerCase()) ||
        op.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        op.blAwb.toLowerCase().includes(busqueda.toLowerCase());
      const matchTipo = filtroTipo === "todos" || op.tipoOperacion === filtroTipo;
      const matchEstado = filtroEstado === "todos" || op.estado === filtroEstado;
      const matchModo = filtroModo === "todos" || op.modoTransporte === filtroModo;
      return matchBusqueda && matchTipo && matchEstado && matchModo;
    });
  }, [busqueda, filtroTipo, filtroEstado, filtroModo]);

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const datosPagina = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operaciones</h1>
          <p className="text-sm text-muted-foreground">Gestión de embarques e importaciones/exportaciones</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => navigate("/operaciones/nuevo")}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Operación
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por consecutivo, cliente, BL/AWB..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                className="pl-10 h-9"
              />
            </div>
            <Select value={filtroTipo} onValueChange={(v) => { setFiltroTipo(v); setPagina(1); }}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Tipo Operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Importación">Importación</SelectItem>
                <SelectItem value="Exportación">Exportación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEstado} onValueChange={(v) => { setFiltroEstado(v); setPagina(1); }}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="En Tránsito">En Tránsito</SelectItem>
                <SelectItem value="En Puerto">En Puerto</SelectItem>
                <SelectItem value="En Aduana">En Aduana</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroModo} onValueChange={(v) => { setFiltroModo(v); setPagina(1); }}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Marítimo">Marítimo</SelectItem>
                <SelectItem value="Aéreo">Aéreo</SelectItem>
                <SelectItem value="Terrestre">Terrestre</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Consecutivo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Origen → Destino</TableHead>
                <TableHead>BL/AWB</TableHead>
                <TableHead className="text-right">Valor USD</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datosPagina.map((op) => (
                <TableRow key={op.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/operaciones/${op.id}`)}>
                  <TableCell className="font-medium text-sm">{op.consecutivo}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{op.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{op.tipoOperacion}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs flex items-center gap-1">
                      {op.modoTransporte === "Marítimo" ? <Ship className="w-3 h-3" /> : "✈️"}
                      {op.modoTransporte}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {op.origen} → {op.destino}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{op.blAwb}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ${op.valorUSD.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${estadoColor[op.estado] || ""}`} variant="outline">
                      {op.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(op.fechaEstimadaLlegada).toLocaleDateString("es-CO")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {datosPagina.length} de {filtradas.length} registros
        </p>
        <div className="flex items-center gap-2">
          <Select value={String(porPagina)} onValueChange={(v) => { setPorPagina(Number(v)); setPagina(1); }}>
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="min-w-[40px]">
              {pagina}/{totalPaginas || 1}
            </Button>
            <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
