import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

const mockPagos = [
  { id: "1", numero: "PAG-2026-001", proveedor: "MAERSK LINE", operacion: "OPE-2026-001", concepto: "Flete Marítimo Shanghai-Buenaventura", montoUSD: 3800, estado: "Pagado", fecha: "2026-02-05" },
  { id: "2", numero: "PAG-2026-002", proveedor: "AGENCIA DE ADUANAS REPRESENTACIONES ABC", operacion: "OPE-2026-003", concepto: "Trámite Aduanero Importación", montoUSD: 450, estado: "Pendiente", fecha: "2026-02-15" },
  { id: "3", numero: "PAG-2026-003", proveedor: "AVIANCA CARGO", operacion: "OPE-2026-006", concepto: "Flete Aéreo Shenzhen-Bogotá", montoUSD: 1200, estado: "Causado", fecha: "2026-02-10" },
  { id: "4", numero: "PAG-2026-004", proveedor: "ALMACÉN ALPOPULAR", operacion: "OPE-2026-004", concepto: "Almacenamiento 30 días", montoUSD: 680, estado: "Pagado", fecha: "2026-01-28" },
  { id: "5", numero: "PAG-2026-005", proveedor: "HAPAG-LLOYD", operacion: "OPE-2026-007", concepto: "Flete Marítimo Buenaventura-Callao", montoUSD: 2100, estado: "Pendiente", fecha: "2026-02-18" },
];

const estadoColor: Record<string, string> = {
  "Pagado": "bg-success/10 text-success",
  "Pendiente": "bg-warning/10 text-warning",
  "Causado": "bg-info/10 text-info",
};

export default function Pagos() {
  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pagos a Terceros</h1>
          <p className="text-sm text-muted-foreground">Causación y pagos a proveedores</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Total Pagado</p>
            <p className="text-xl font-bold text-success">
              USD ${mockPagos.filter(p => p.estado === "Pagado").reduce((s, p) => s + p.montoUSD, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Pendiente</p>
            <p className="text-xl font-bold text-warning">
              USD ${mockPagos.filter(p => p.estado === "Pendiente").reduce((s, p) => s + p.montoUSD, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Causado (sin pagar)</p>
            <p className="text-xl font-bold text-info">
              USD ${mockPagos.filter(p => p.estado === "Causado").reduce((s, p) => s + p.montoUSD, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto USD</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPagos.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{p.numero}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{p.proveedor}</TableCell>
                  <TableCell className="text-xs font-mono">{p.operacion}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{p.concepto}</TableCell>
                  <TableCell className="text-right font-medium">${p.montoUSD.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${estadoColor[p.estado]}`} variant="outline">
                      {p.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.fecha).toLocaleDateString("es-CO")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
