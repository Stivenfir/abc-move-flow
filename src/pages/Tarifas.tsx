import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, DollarSign } from "lucide-react";

interface Tarifa {
  id: string;
  tipoOperacion: "Importaciones" | "Exportaciones";
  modoTransporte: "Aereo" | "Maritimo";
  ordenImpresion: number;
  tasaPorcentual: number;
  valorMinimoCols: number;
  concepto: string;
  rolAplica: string;
  requiereDetalle: boolean;
  codigoSiigo: string;
  terceroPropio: "T" | "O" | "P";
  exigeTotales: boolean;
}

const conceptos = [
  "FERIAS", "GASTOS DE IMPORTACION EN DESTINO", "Forwarder Fee", "Stand by",
  "FMM INGRESO", "FMM SALIDA", "BASCULA INGRESO", "BASCULA SALIDA",
  "MOUNTING", "GASTOS DE EXPORTACIÓN EN ORIGEN",
];

const mockTarifas: Tarifa[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  tipoOperacion: i % 3 === 0 ? "Exportaciones" : "Importaciones",
  modoTransporte: i % 4 === 0 ? "Aereo" : "Maritimo",
  ordenImpresion: i + 1,
  tasaPorcentual: [0.5, 1, 1.5, 2, 2.5, 3, 0.75, 1.25][i % 8],
  valorMinimoCols: [50000, 80000, 120000, 150000, 200000, 35000, 95000, 180000][i % 8],
  concepto: conceptos[i % conceptos.length],
  rolAplica: ["Comercial", "Operaciones", "Finanzas", "Aduanas", "Todos"][i % 5],
  requiereDetalle: i % 3 === 0,
  codigoSiigo: `SG-${String(1000 + i)}`,
  terceroPropio: (["T", "O", "P"] as const)[i % 3],
  exigeTotales: i % 2 === 0,
}));

export default function Tarifas() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroOperacion, setFiltroOperacion] = useState<string>("todos");
  const [filtroTransporte, setFiltroTransporte] = useState<string>("todos");
  const [porPagina, setPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const filtradas = mockTarifas.filter(t => {
    const matchBusqueda = t.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.codigoSiigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchOp = filtroOperacion === "todos" || t.tipoOperacion === filtroOperacion;
    const matchTrans = filtroTransporte === "todos" || t.modoTransporte === filtroTransporte;
    return matchBusqueda && matchOp && matchTrans;
  });

  const totalPaginas = Math.ceil(filtradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const paginadas = filtradas.slice(inicio, inicio + porPagina);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarifas Repecev</h1>
          <p className="text-muted-foreground">Gestión de tarifas con {mockTarifas.length} registros configurados</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nueva Tarifa</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por concepto o código SIIGO..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
            </div>
            <Select value={filtroOperacion} onValueChange={v => { setFiltroOperacion(v); setPaginaActual(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo Operación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Importaciones">Importaciones</SelectItem>
                <SelectItem value="Exportaciones">Exportaciones</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTransporte} onValueChange={v => { setFiltroTransporte(v); setPaginaActual(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Modo Transporte" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Aereo">Aéreo</SelectItem>
                <SelectItem value="Maritimo">Marítimo</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Tarifas ({filtradas.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operación</TableHead>
                  <TableHead>Transporte</TableHead>
                  <TableHead className="text-center">Orden</TableHead>
                  <TableHead className="text-right">Tasa %</TableHead>
                  <TableHead className="text-right">Valor Mín (COP)</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Rol Aplica</TableHead>
                  <TableHead className="text-center">Req. Detalle</TableHead>
                  <TableHead>Cód. SIIGO</TableHead>
                  <TableHead className="text-center">T/O/P</TableHead>
                  <TableHead className="text-center">Exige Totales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginadas.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Badge variant={t.tipoOperacion === "Importaciones" ? "default" : "secondary"}>
                        {t.tipoOperacion}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.modoTransporte}</TableCell>
                    <TableCell className="text-center">{t.ordenImpresion}</TableCell>
                    <TableCell className="text-right font-mono">{t.tasaPorcentual}%</TableCell>
                    <TableCell className="text-right font-mono">${t.valorMinimoCols.toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.concepto}</TableCell>
                    <TableCell>{t.rolAplica}</TableCell>
                    <TableCell className="text-center">{t.requiereDetalle ? "Sí" : "No"}</TableCell>
                    <TableCell className="font-mono">{t.codigoSiigo}</TableCell>
                    <TableCell className="text-center font-medium">{t.terceroPropio}</TableCell>
                    <TableCell className="text-center">{t.exigeTotales ? "Sí" : "No"}</TableCell>
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
    </div>
  );
}
