import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const isNew = id === "nuevo";
  const factura = !isNew ? mockFacturas.find(f => f.id === id) : null;

  const [form, setForm] = useState({
    numero: factura?.numero || "",
    cliente: factura?.cliente || "",
    operacion: factura?.operacion || "",
    concepto: factura?.concepto || "",
    montoUSD: factura?.montoUSD?.toString() || "",
    fecha: factura?.fecha || new Date().toISOString().split("T")[0],
    estado: factura?.estado || "Borrador",
    moneda: "USD",
    formaPago: "",
    diasCredito: "30",
    observaciones: "",
    nit: "",
    direccionCliente: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  if (!isNew && !factura) {
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
          <h1 className="text-2xl font-bold">{isNew ? "Nueva Factura" : `Factura ${factura?.numero}`}</h1>
          <p className="text-sm text-muted-foreground">Detalle de facturación</p>
        </div>
        {!isNew && <Badge className={`ml-auto ${estadoColor[factura!.estado]}`} variant="outline">{factura!.estado}</Badge>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la Factura</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">Número</Label><Input value={isNew ? "(Auto-generado)" : form.numero} disabled className="bg-muted/50 h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Cliente</Label><Input value={form.cliente} onChange={e => update("cliente", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">NIT / ID Fiscal</Label><Input value={form.nit} onChange={e => update("nit", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Dirección Cliente</Label><Input value={form.direccionCliente} onChange={e => update("direccionCliente", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Operación Vinculada</Label><Input value={form.operacion} onChange={e => update("operacion", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Concepto</Label><Input value={form.concepto} onChange={e => update("concepto", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Monto</Label><Input type="number" value={form.montoUSD} onChange={e => update("montoUSD", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Moneda</Label>
            <Select value={form.moneda} onValueChange={v => update("moneda", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={form.fecha} onChange={e => update("fecha", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <Select value={form.estado} onValueChange={v => update("estado", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Pagada">Pagada</SelectItem>
                <SelectItem value="Vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Forma de Pago</Label>
            <Select value={form.formaPago} onValueChange={v => update("formaPago", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Días Crédito</Label><Input type="number" value={form.diasCredito} onChange={e => update("diasCredito", e.target.value)} className="h-9" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Observaciones</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.observaciones} onChange={e => update("observaciones", e.target.value)} rows={3} placeholder="Notas adicionales..." />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => toast(isNew ? "Registro generado exitosamente" : "Registro actualizado correctamente")}>
          <Save className="w-4 h-4 mr-2" />{isNew ? "Insertar" : "Actualizar"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/finanzas/facturacion")}><List className="w-4 h-4 mr-2" />Listado</Button>
      </div>
    </div>
  );
}
