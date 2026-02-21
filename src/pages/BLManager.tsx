import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockBLs = [
  { id: "1", blNumber: "BL-2026-001", operacion: "OPE-2026-001", shipper: "MABE COLOMBIA SAS", consignee: "MABE USA INC", pol: "Buenaventura", pod: "Miami", estado: "Emitido", fecha: "2026-02-05" },
  { id: "2", blNumber: "BL-2026-002", operacion: "OPE-2026-002", shipper: "INGERSOLL-RAND COL", consignee: "IR HOLDINGS LLC", pol: "Cartagena", pod: "Houston", estado: "Borrador", fecha: "2026-02-12" },
];

const estadoColor: Record<string, string> = {
  Emitido: "bg-success/10 text-success border-success/20",
  Borrador: "bg-muted text-muted-foreground border-border",
};

export default function BLManager() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    if (!busqueda) return mockBLs;
    const q = busqueda.toLowerCase();
    return mockBLs.filter(b => b.blNumber.toLowerCase().includes(q) || b.shipper.toLowerCase().includes(q) || b.consignee.toLowerCase().includes(q));
  }, [busqueda]);

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de BL</h1>
          <p className="text-sm text-muted-foreground">Bills of Lading asociados a operaciones</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => navigate("/documentacion/bl/nuevo")}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo BL
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por BL, shipper, consignee..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10 h-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. BL</TableHead>
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
              {filtrados.map(bl => (
                <TableRow key={bl.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/documentacion/bl/${bl.id}`)}>
                  <TableCell className="font-medium text-sm">{bl.blNumber}</TableCell>
                  <TableCell className="text-xs font-mono">{bl.operacion}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{bl.shipper}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{bl.consignee}</TableCell>
                  <TableCell className="text-xs">{bl.pol}</TableCell>
                  <TableCell className="text-xs">{bl.pod}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${estadoColor[bl.estado] || ""}`} variant="outline">{bl.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(bl.fecha).toLocaleDateString("es-CO")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
