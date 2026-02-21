import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, List } from "lucide-react";
import { mockOperaciones } from "@/lib/logisticsData";
import { toast } from "sonner";

const mockBLs = [
  { id: "1", blNumber: "BL-2026-001", operacion: "OPE-2026-001", shipper: "MABE COLOMBIA SAS\nCra 7 #123-45, Bogotá", consignee: "MABE USA INC\n1234 Main St, Miami FL 33101", notifyParty: "MABE USA INC\n1234 Main St, Miami FL 33101", pol: "Buenaventura", pod: "Miami", placeOfDelivery: "Miami, FL", vesselVoyage: "MSC ANNA V.2026W", descriptionOfGoods: "HOUSEHOLD GOODS AND PERSONAL EFFECTS\n20 BOXES", numberOfPackages: 20, grossWeight: 2500, measurement: 18.5, marksAndNumbers: "MABE/MIA/001-020", freightTerms: "Prepaid", estado: "Emitido" },
  { id: "2", blNumber: "BL-2026-002", operacion: "OPE-2026-002", shipper: "INGERSOLL-RAND COL\nZona Franca, Barranquilla", consignee: "IR HOLDINGS LLC\n800 Beaty St, Houston TX", notifyParty: "IR HOLDINGS LLC\n800 Beaty St, Houston TX", pol: "Cartagena", pod: "Houston", placeOfDelivery: "Houston, TX", vesselVoyage: "MAERSK LEON V.108E", descriptionOfGoods: "INDUSTRIAL SPARE PARTS\n15 CRATES", numberOfPackages: 15, grossWeight: 4200, measurement: 32, marksAndNumbers: "IR/HOU/001-015", freightTerms: "Collect", estado: "Borrador" },
];

export default function BLDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "nuevo";
  const bl = !isNew ? mockBLs.find(b => b.id === id) : null;

  const [form, setForm] = useState({
    blNumber: bl?.blNumber || "",
    operacion: bl?.operacion || "",
    shipper: bl?.shipper || "",
    consignee: bl?.consignee || "",
    notifyParty: bl?.notifyParty || "",
    pol: bl?.pol || "",
    pod: bl?.pod || "",
    placeOfDelivery: bl?.placeOfDelivery || "",
    vesselVoyage: bl?.vesselVoyage || "",
    descriptionOfGoods: bl?.descriptionOfGoods || "",
    numberOfPackages: bl?.numberOfPackages?.toString() || "",
    grossWeight: bl?.grossWeight?.toString() || "",
    measurement: bl?.measurement?.toString() || "",
    marksAndNumbers: bl?.marksAndNumbers || "",
    freightTerms: bl?.freightTerms || "",
    estado: bl?.estado || "Borrador",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/documentacion/bl")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isNew ? "Nuevo Bill of Lading" : `BL ${form.blNumber}`}</h1>
          <p className="text-sm text-muted-foreground">Bill of Lading</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos Generales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">No. BL</Label><Input value={isNew ? "(Auto-generado)" : form.blNumber} disabled className="bg-muted/50 h-9" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Operación Vinculada</Label>
            <Select value={form.operacion} onValueChange={v => update("operacion", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {mockOperaciones.map(op => <SelectItem key={op.id} value={op.consecutivo}>{op.consecutivo} - {op.cliente}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <Select value={form.estado} onValueChange={v => update("estado", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Emitido">Emitido</SelectItem>
                <SelectItem value="Corregido">Corregido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Partes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">Shipper</Label><Textarea value={form.shipper} onChange={e => update("shipper", e.target.value)} rows={4} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Consignee</Label><Textarea value={form.consignee} onChange={e => update("consignee", e.target.value)} rows={4} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Notify Party</Label><Textarea value={form.notifyParty} onChange={e => update("notifyParty", e.target.value)} rows={4} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Puertos y Ruta</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">POL</Label><Input value={form.pol} onChange={e => update("pol", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">POD</Label><Input value={form.pod} onChange={e => update("pod", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Place of Delivery</Label><Input value={form.placeOfDelivery} onChange={e => update("placeOfDelivery", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Vessel / Voyage</Label><Input value={form.vesselVoyage} onChange={e => update("vesselVoyage", e.target.value)} className="h-9" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalles de Carga</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label className="text-xs">Number of Packages</Label><Input type="number" value={form.numberOfPackages} onChange={e => update("numberOfPackages", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Gross Weight (kg)</Label><Input type="number" value={form.grossWeight} onChange={e => update("grossWeight", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Measurement (m³)</Label><Input type="number" value={form.measurement} onChange={e => update("measurement", e.target.value)} className="h-9" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Freight Terms</Label>
            <Select value={form.freightTerms} onValueChange={v => update("freightTerms", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Prepaid">Prepaid</SelectItem>
                <SelectItem value="Collect">Collect</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3"><Label className="text-xs">Marks and Numbers</Label><Textarea value={form.marksAndNumbers} onChange={e => update("marksAndNumbers", e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Descripción de Mercancía</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.descriptionOfGoods} onChange={e => update("descriptionOfGoods", e.target.value)} rows={5} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => toast(isNew ? "Registro generado exitosamente" : "Registro actualizado correctamente")}>
          <Save className="w-4 h-4 mr-2" />{isNew ? "Insertar" : "Actualizar"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/documentacion/bl")}><List className="w-4 h-4 mr-2" />Listado</Button>
      </div>
    </div>
  );
}
