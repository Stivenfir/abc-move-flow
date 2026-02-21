import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

const mockInstrucciones = [
  { id: "1", consecutivo: "SI-2026-001", operacion: "DO-2026-001", shipper: "MABE COLOMBIA SAS", consignee: "MABE USA INC", pol: "Buenaventura", pod: "Miami", estado: "Borrador", fecha: "2026-02-10" },
  { id: "2", consecutivo: "SI-2026-002", operacion: "DO-2026-002", shipper: "INGERSOLL-RAND COL", consignee: "IR HOLDINGS LLC", pol: "Cartagena", pod: "Houston", estado: "Enviado", fecha: "2026-02-12" },
  { id: "3", consecutivo: "SI-2026-003", operacion: "DO-2026-003", shipper: "EMBAJADA EEUU", consignee: "US DEPT OF STATE", pol: "Shanghai", pod: "Buenaventura", estado: "Confirmado", fecha: "2026-02-14" },
  { id: "4", consecutivo: "SI-2026-004", operacion: "DO-2026-004", shipper: "ALPINA SA", consignee: "ALPINA FOODS USA", pol: "Buenaventura", pod: "New York", estado: "Borrador", fecha: "2026-02-16" },
];

export default function InstruccionesEmbarque() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");

  const filtered = mockInstrucciones.filter(i => {
    const matchSearch = !search || Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchEstado = estadoFilter === "todos" || i.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  const estadoColor = (e: string) => e === "Confirmado" ? "default" : e === "Enviado" ? "secondary" : "outline";

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instrucciones de Embarque</h1>
          <p className="text-sm text-muted-foreground">Shipping Instructions para operaciones</p>
        </div>
        <Button onClick={() => navigate("/documentacion/instrucciones/nuevo")}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Instrucción
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consecutivo</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Shipper</TableHead>
                <TableHead>Consignee</TableHead>
                <TableHead>POL</TableHead>
                <TableHead>POD</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(i => (
                <TableRow key={i.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/documentacion/instrucciones/${i.id}`)}>
                  <TableCell className="font-medium">{i.consecutivo}</TableCell>
                  <TableCell>{i.operacion}</TableCell>
                  <TableCell>{i.shipper}</TableCell>
                  <TableCell>{i.consignee}</TableCell>
                  <TableCell>{i.pol}</TableCell>
                  <TableCell>{i.pod}</TableCell>
                  <TableCell><Badge variant={estadoColor(i.estado)}>{i.estado}</Badge></TableCell>
                  <TableCell>{i.fecha}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
