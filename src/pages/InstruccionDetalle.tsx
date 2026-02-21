import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, List, FileText } from "lucide-react";
import { mockOperaciones } from "@/lib/logisticsData";
import { toast } from "sonner";

const mockInstrucciones = [
  { id: "1", consecutivo: "SI-2026-001", operacionId: "1", shipper: "MABE COLOMBIA SAS\nCra 7 #123-45, Bogotá, Colombia", consignee: "MABE USA INC\n1234 Main St, Miami FL 33101", notifyParty: "MABE USA INC\n1234 Main St, Miami FL 33101", pol: "Buenaventura", pod: "Miami", placeOfDelivery: "Miami, FL", descriptionOfGoods: "HOUSEHOLD GOODS AND PERSONAL EFFECTS\n20 BOXES, 5 PALLETS\nGROSS WEIGHT: 2,500 KG", estado: "Borrador", vesselVoyage: "MSC ANNA V.2026W", numberOfPackages: 25, grossWeight: 2500, measurement: 18.5, marksAndNumbers: "MABE/MIA/001-025\nN/M", freightTerms: "Prepaid" },
  { id: "2", consecutivo: "SI-2026-002", operacionId: "2", shipper: "INGERSOLL-RAND COL\nZona Franca, Barranquilla", consignee: "IR HOLDINGS LLC\n800 Beaty St, Houston TX", notifyParty: "IR HOLDINGS LLC\n800 Beaty St, Houston TX", pol: "Cartagena", pod: "Houston", placeOfDelivery: "Houston, TX", descriptionOfGoods: "INDUSTRIAL SPARE PARTS\n15 CRATES\nGROSS WEIGHT: 4,200 KG", estado: "Enviado", vesselVoyage: "MAERSK LEON V.108E", numberOfPackages: 15, grossWeight: 4200, measurement: 32.0, marksAndNumbers: "IR/HOU/001-015", freightTerms: "Collect" },
];

export default function InstruccionDetalle() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "nuevo";
  const instruccion = !isNew ? mockInstrucciones.find(i => i.id === id) : null;

  const prefilledOpId = searchParams.get("operacionId") || "";

  const [form, setForm] = useState({
    consecutivo: instruccion?.consecutivo || "",
    operacionId: instruccion?.operacionId || prefilledOpId,
    shipper: instruccion?.shipper || "",
    consignee: instruccion?.consignee || "",
    notifyParty: instruccion?.notifyParty || "",
    pol: instruccion?.pol || "",
    pod: instruccion?.pod || "",
    placeOfDelivery: instruccion?.placeOfDelivery || "",
    descriptionOfGoods: instruccion?.descriptionOfGoods || "",
    estado: instruccion?.estado || "Borrador",
    vesselVoyage: instruccion?.vesselVoyage || "",
    numberOfPackages: instruccion?.numberOfPackages?.toString() || "",
    grossWeight: instruccion?.grossWeight?.toString() || "",
    measurement: instruccion?.measurement?.toString() || "",
    marksAndNumbers: instruccion?.marksAndNumbers || "",
    freightTerms: instruccion?.freightTerms || "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/documentacion/instrucciones")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? "Nueva Instrucción de Embarque" : `Instrucción ${form.consecutivo}`}
          </h1>
          <p className="text-sm text-muted-foreground">Shipping Instructions</p>
        </div>
      </div>

      {/* Operación asociada */}
      <Card>
        <CardHeader><CardTitle className="text-base">Operación Asociada</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificador</Label>
            <Input value={isNew ? "(Auto-generado)" : form.consecutivo} disabled className="bg-muted/50 h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Operación Asociada (DO)</Label>
            <Select value={form.operacionId} onValueChange={v => update("operacionId", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar operación..." /></SelectTrigger>
              <SelectContent>
                {mockOperaciones.map(op => (
                  <SelectItem key={op.id} value={op.id}>{op.consecutivo} - {op.cliente}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <Select value={form.estado} onValueChange={v => update("estado", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Partes Involucradas</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Shipper (Nombre + Dirección)</Label>
            <Textarea value={form.shipper} onChange={e => update("shipper", e.target.value)} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Consignee (Nombre + Dirección)</Label>
            <Textarea value={form.consignee} onChange={e => update("consignee", e.target.value)} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notify Party (Nombre + Dirección)</Label>
            <Textarea value={form.notifyParty} onChange={e => update("notifyParty", e.target.value)} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Puertos y Ruta */}
      <Card>
        <CardHeader><CardTitle className="text-base">Puertos y Ruta</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Port of Loading (POL)</Label>
            <Input value={form.pol} onChange={e => update("pol", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Port of Discharge (POD)</Label>
            <Input value={form.pod} onChange={e => update("pod", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Place of Delivery</Label>
            <Input value={form.placeOfDelivery} onChange={e => update("placeOfDelivery", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Detalles de Carga */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detalles de Carga</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Vessel / Voyage</Label>
            <Input value={form.vesselVoyage} onChange={e => update("vesselVoyage", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Number of Packages</Label>
            <Input type="number" value={form.numberOfPackages} onChange={e => update("numberOfPackages", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Gross Weight (kg)</Label>
            <Input type="number" value={form.grossWeight} onChange={e => update("grossWeight", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Measurement / Volume (m³)</Label>
            <Input type="number" value={form.measurement} onChange={e => update("measurement", e.target.value)} className="h-9" />
          </div>
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
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <Label className="text-xs">Marks and Numbers</Label>
            <Textarea value={form.marksAndNumbers} onChange={e => update("marksAndNumbers", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Descripción de Mercancía */}
      <Card>
        <CardHeader><CardTitle className="text-base">Descripción de Mercancía</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label className="text-xs">Description of Goods</Label>
            <Textarea value={form.descriptionOfGoods} onChange={e => update("descriptionOfGoods", e.target.value)} rows={6} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover" onClick={() => toast(isNew ? "Registro generado exitosamente" : "Registro actualizado correctamente")}>
          <Save className="w-4 h-4 mr-2" />
          {isNew ? "Insertar" : "Actualizar"}
        </Button>
        {!isNew && (
          <Button variant="secondary" onClick={() => {
            navigate(`/documentacion/bl/nuevo?instruccionId=${id}`);
            toast("Registro generado exitosamente");
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Generar BL
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate("/documentacion/instrucciones")}>
          <List className="w-4 h-4 mr-2" />
          Listado
        </Button>
      </div>
    </div>
  );
}
