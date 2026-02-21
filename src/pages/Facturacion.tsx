import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockFacturas = [
  { id: "1", numero: "FAC-2026-001", cliente: "MABE COLOMBIA SAS", operacion: "OPE-2026-001", concepto: "Flete Marítimo FCL", montoUSD: 4500, estado: "Pagada", fecha: "2026-02-01" },
  { id: "2", numero: "FAC-2026-002", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS", operacion: "OPE-2026-003", concepto: "Flete Aéreo + Handling", montoUSD: 3200, estado: "Pendiente", fecha: "2026-02-10" },
  { id: "3", numero: "FAC-2026-003", cliente: "INGERSOLL - RAND COLOMBIA SAS", operacion: "OPE-2026-002", concepto: "Exportación FCL", montoUSD: 5100, estado: "Vencida", fecha: "2026-01-15" },
  { id: "4", numero: "FAC-2026-004", cliente: "POLIEMPAK SAS", operacion: "OPE-2026-007", concepto: "Flete Marítimo FCL Export", montoUSD: 2800, estado: "Pendiente", fecha: "2026-02-12" },
  { id: "5", numero: "FAC-2026-005", cliente: "PROMOS LTDA", operacion: "OPE-2026-006", concepto: "Flete Aéreo LCL", montoUSD: 1500, estado: "Borrador", fecha: "2026-02-18" },
];

const estadoColor: Record<string, string> = {
  "Pagada": "bg-success/10 text-success",
  "Pendiente": "bg-warning/10 text-warning",
  "Vencida": "bg-destructive/10 text-destructive",
  "Borrador": "bg-muted text-muted-foreground",
};

export default function Facturacion() {
  const navigate = useNavigate();
  const totalPendiente = mockFacturas.filter(f => f.estado === "Pendiente" || f.estado === "Vencida").reduce((s, f) => s + f.montoUSD, 0);

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facturación</h1>
          <p className="text-sm text-muted-foreground">Gestión de facturación y causación</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => navigate("/finanzas/facturacion/nuevo")}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Total Facturado</p>
            <p className="text-xl font-bold">USD ${mockFacturas.reduce((s, f) => s + f.montoUSD, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Pendiente de Cobro</p>
            <p className="text-xl font-bold text-warning">USD ${totalPendiente.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Facturas Emitidas</p>
            <p className="text-xl font-bold">{mockFacturas.length}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground">Vencidas</p>
            <p className="text-xl font-bold text-destructive">{mockFacturas.filter(f => f.estado === "Vencida").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto USD</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFacturas.map((f) => (
                <TableRow key={f.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/finanzas/facturacion/${f.id}`)}>
                  <TableCell className="font-medium text-sm">{f.numero}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{f.cliente}</TableCell>
                  <TableCell className="text-xs font-mono">{f.operacion}</TableCell>
                  <TableCell className="text-xs">{f.concepto}</TableCell>
                  <TableCell className="text-right font-medium">${f.montoUSD.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${estadoColor[f.estado]}`} variant="outline">
                      {f.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(f.fecha).toLocaleDateString("es-CO")}
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
