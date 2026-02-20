import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Eye, FileText, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Solicitud {
  id: string;
  consecutivo: string;
  cliente: string;
  lineaProyecto: "CORPORATIVO" | "PROYECTO";
  comercial: string;
  servicioNombre: string;
  tipoMercancia: string;
  fechaCondicion: string;
  tipoOperacion: "Importación" | "Exportación";
  modoTransporte: "Aéreo" | "Marítimo";
  activa: boolean;
  tipoNegociacion: string;
  cancelado: boolean;
  cerrado: boolean;
  division: "CI" | "CE";
  generador: "Propio" | "Tercero";
  clase: string;
  fechaCreacion: string;
}

const mockSolicitudes: Solicitud[] = [
  { id: "1", consecutivo: "SOL-2026-001", cliente: "MABE COLOMBIA SAS", lineaProyecto: "CORPORATIVO", comercial: "Carlos Mendoza", servicioNombre: "FCL Import", tipoMercancia: "CARGA GENERAL", fechaCondicion: "2026-02-15", tipoOperacion: "Importación", modoTransporte: "Marítimo", activa: true, tipoNegociacion: "CIF", cancelado: false, cerrado: false, division: "CI", generador: "Propio", clase: "A", fechaCreacion: "2026-01-20" },
  { id: "2", consecutivo: "SOL-2026-002", cliente: "INGERSOLL - RAND COLOMBIA SAS", lineaProyecto: "PROYECTO", comercial: "Ana García", servicioNombre: "LCL Export", tipoMercancia: "REPUESTO", fechaCondicion: "2026-02-01", tipoOperacion: "Exportación", modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FOB", cancelado: false, cerrado: false, division: "CE", generador: "Tercero", clase: "B", fechaCreacion: "2026-01-15" },
  { id: "3", consecutivo: "SOL-2026-003", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS", lineaProyecto: "CORPORATIVO", comercial: "Carlos Mendoza", servicioNombre: "Air Freight", tipoMercancia: "BULTO", fechaCondicion: "2026-02-10", tipoOperacion: "Importación", modoTransporte: "Aéreo", activa: true, tipoNegociacion: "DDP", cancelado: false, cerrado: false, division: "CI", generador: "Propio", clase: "A", fechaCreacion: "2026-02-01" },
  { id: "4", consecutivo: "SOL-2026-004", cliente: "WODEN COLOMBIA SAS", lineaProyecto: "PROYECTO", comercial: "Luisa Rodríguez", servicioNombre: "FCL Import", tipoMercancia: "GARRAFAS", fechaCondicion: "2026-01-28", tipoOperacion: "Importación", modoTransporte: "Marítimo", activa: false, tipoNegociacion: "EXW", cancelado: false, cerrado: true, division: "CI", generador: "Propio", clase: "C", fechaCreacion: "2025-12-10" },
  { id: "5", consecutivo: "SOL-2026-005", cliente: "VARISUR SAS", lineaProyecto: "CORPORATIVO", comercial: "Ana García", servicioNombre: "Reefer Export", tipoMercancia: "SOBRE", fechaCondicion: "2026-02-18", tipoOperacion: "Exportación", modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FCA", cancelado: false, cerrado: false, division: "CE", generador: "Tercero", clase: "A", fechaCreacion: "2026-02-15" },
  { id: "6", consecutivo: "SOL-2026-006", cliente: "PROMOS LTDA", lineaProyecto: "PROYECTO", comercial: "Luisa Rodríguez", servicioNombre: "Air Cargo", tipoMercancia: "CARGA GENERAL", fechaCondicion: "2026-02-05", tipoOperacion: "Importación", modoTransporte: "Aéreo", activa: true, tipoNegociacion: "CIP", cancelado: false, cerrado: false, division: "CI", generador: "Propio", clase: "B", fechaCreacion: "2026-02-03" },
  { id: "7", consecutivo: "SOL-2026-007", cliente: "POLIEMPAK SAS", lineaProyecto: "CORPORATIVO", comercial: "Carlos Mendoza", servicioNombre: "FCL Export", tipoMercancia: "BULTO", fechaCondicion: "2026-02-12", tipoOperacion: "Exportación", modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FOB", cancelado: false, cerrado: false, division: "CE", generador: "Propio", clase: "A", fechaCreacion: "2026-02-08" },
  { id: "8", consecutivo: "SOL-2025-098", cliente: "MABE COLOMBIA SAS", lineaProyecto: "PROYECTO", comercial: "Ana García", servicioNombre: "FCL Import", tipoMercancia: "REPUESTO", fechaCondicion: "2025-12-15", tipoOperacion: "Importación", modoTransporte: "Marítimo", activa: false, tipoNegociacion: "CIF", cancelado: true, cerrado: false, division: "CI", generador: "Tercero", clase: "C", fechaCreacion: "2025-11-20" },
];

export default function Solicitudes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroOperacion, setFiltroOperacion] = useState<string>("todos");
  const [filtroTransporte, setFiltroTransporte] = useState<string>("todos");
  const [porPagina, setPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [detalle, setDetalle] = useState<Solicitud | null>(null);

  const filtradas = mockSolicitudes.filter(s => {
    const matchBusqueda = s.consecutivo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.comercial.toLowerCase().includes(busqueda.toLowerCase());
    const matchOp = filtroOperacion === "todos" || s.tipoOperacion === filtroOperacion;
    const matchTrans = filtroTransporte === "todos" || s.modoTransporte === filtroTransporte;
    return matchBusqueda && matchOp && matchTrans;
  });

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const paginadas = filtradas.slice(inicio, inicio + porPagina);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solicitudes de Servicio</h1>
          <p className="text-muted-foreground">Gestión de solicitudes de operaciones logísticas</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nueva Solicitud</Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por consecutivo, cliente o comercial..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
            </div>
            <Select value={filtroOperacion} onValueChange={setFiltroOperacion}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo Operación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Importación">Importación</SelectItem>
                <SelectItem value="Exportación">Exportación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTransporte} onValueChange={setFiltroTransporte}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Modo Transporte" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Aéreo">Aéreo</SelectItem>
                <SelectItem value="Marítimo">Marítimo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={porPagina.toString()} onValueChange={v => { setPorPagina(Number(v)); setPaginaActual(1); }}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / pág</SelectItem>
                <SelectItem value="25">25 / pág</SelectItem>
                <SelectItem value="50">50 / pág</SelectItem>
                <SelectItem value="100">100 / pág</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Solicitudes ({filtradas.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consecutivo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Línea Proyecto</TableHead>
                  <TableHead>Comercial</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Mercancía</TableHead>
                  <TableHead>Fecha Cond.</TableHead>
                  <TableHead>Operación</TableHead>
                  <TableHead>Transporte</TableHead>
                  <TableHead>Negociación</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginadas.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/comercial/solicitudes/${s.id}`)}>
                    <TableCell className="font-mono font-medium">{s.consecutivo}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{s.cliente}</TableCell>
                    <TableCell><Badge variant="outline">{s.lineaProyecto}</Badge></TableCell>
                    <TableCell>{s.comercial}</TableCell>
                    <TableCell>{s.servicioNombre}</TableCell>
                    <TableCell>{s.tipoMercancia}</TableCell>
                    <TableCell>{s.fechaCondicion}</TableCell>
                    <TableCell>
                      <Badge variant={s.tipoOperacion === "Importación" ? "default" : "secondary"}>
                        {s.tipoOperacion}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.modoTransporte}</TableCell>
                    <TableCell><Badge variant="outline">{s.tipoNegociacion}</Badge></TableCell>
                    <TableCell>
                      <span className={`inline-block w-3 h-3 rounded-full ${s.activa ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    </TableCell>
                    <TableCell>
                      {s.cancelado ? <Badge variant="destructive">Cancelado</Badge> :
                       s.cerrado ? <Badge variant="secondary">Cerrado</Badge> :
                       <Badge className="bg-green-600 text-white">Abierto</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDetalle(s)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Mostrando {inicio + 1}-{Math.min(inicio + porPagina, filtradas.length)} de {filtradas.length}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={paginaActual >= totalPaginas} onClick={() => setPaginaActual(p => p + 1)}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Detalle */}
      <Dialog open={!!detalle} onOpenChange={open => !open && setDetalle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle Solicitud: {detalle?.consecutivo}</DialogTitle>
          </DialogHeader>
          {detalle && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Identificador", detalle.consecutivo],
                ["Fecha Creación", detalle.fechaCreacion],
                ["Cliente", detalle.cliente],
                ["Línea Proyecto", detalle.lineaProyecto],
                ["Comercial", detalle.comercial],
                ["Servicio Nombre", detalle.servicioNombre],
                ["Tipo Mercancía", detalle.tipoMercancia],
                ["Fecha Condición", detalle.fechaCondicion],
                ["Tipo Operación", detalle.tipoOperacion],
                ["Modo Transporte", detalle.modoTransporte],
                ["Tipo Negociación", detalle.tipoNegociacion],
                ["División", detalle.division],
                ["Generador", detalle.generador],
                ["Activa", detalle.activa ? "Sí" : "No"],
                ["Cerrado", detalle.cerrado ? "Sí" : "No"],
                ["Cancelado", detalle.cancelado ? "Sí" : "No"],
                ["Clase", detalle.clase],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
