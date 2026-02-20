import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List } from "lucide-react";

const mockFacturas = [
  { id: "1", numero: "FAC-2026-001", cliente: "MABE COLOMBIA SAS", operacion: "OPE-2026-001", concepto: "Flete Marítimo FCL", montoUSD: 4500, estado: "Pagada", fecha: "2026-02-01" },
  { id: "2", numero: "FAC-2026-002", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS", operacion: "OPE-2026-003", concepto: "Flete Aéreo + Handling", montoUSD: 3200, estado: "Pendiente", fecha: "2026-02-10" },
  { id: "3", numero: "FAC-2026-003", cliente: "INGERSOLL - RAND COLOMBIA SAS", operacion: "OPE-2026-002", concepto: "Exportación FCL", montoUSD: 5100, estado: "Vencida", fecha: "2026-01-15" },
  { id: "4", numero: "FAC-2026-004", cliente: "POLIEMPAK SAS", operacion: "OPE-2026-007", concepto: "Flete Marítimo FCL Export", montoUSD: 2800, estado: "Pendiente", fecha: "2026-02-12" },
  { id: "5", numero: "FAC-2026-005", cliente: "PROMOS LTDA", operacion: "OPE-2026-006", concepto: "Flete Aéreo LCL", montoUSD: 1500, estado: "Borrador", fecha: "2026-02-18" },
];

const estadoColor: Record<string, string> = {
  Pagada: "bg-success/10 text-success",
  Pendiente: "bg-warning/10 text-warning",
  Vencida: "bg-destructive/10 text-destructive",
  Borrador: "bg-muted text-muted-foreground",
};

export default function FacturaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const factura = mockFacturas.find(f => f.id === id);

  if (!factura) {
    return (
      <div className="container-dashboard py-12 text-center">
        <p className="text-muted-foreground">Factura no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/finanzas/facturacion")}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/finanzas/facturacion")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Factura {factura.numero}</h1>
          <p className="text-sm text-muted-foreground">Detalle de facturación</p>
        </div>
        <Badge className={`ml-auto ${estadoColor[factura.estado]}`} variant="outline">{factura.estado}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la Factura</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">Número</Label><Input value={factura.numero} disabled className="bg-muted/50 h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={factura.cliente} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Operación Vinculada</Label><Input value={factura.operacion} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Concepto</Label><Input value={factura.concepto} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Monto USD</Label><Input type="number" value={factura.montoUSD} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={factura.fecha} className="h-9" /></div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover"><Save className="w-4 h-4 mr-2" />Actualizar</Button>
        <Button variant="outline" onClick={() => navigate("/finanzas/facturacion")}><List className="w-4 h-4 mr-2" />Listado</Button>
      </div>
    </div>
  );
}
