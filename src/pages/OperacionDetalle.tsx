import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, List, FileText } from "lucide-react";
import { toast } from "sonner";
import { mockOperaciones, mockClientes, mockUsuarios } from "@/lib/logisticsData";

export default function OperacionDetalle() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const operacion = id && id !== "nuevo" ? mockOperaciones.find(o => o.id === id) : null;
  const isNew = id === "nuevo";

  const [form, setForm] = useState({
    consecutivo: operacion?.consecutivo || "",
    fechaCreacion: operacion?.fechaCreacion || new Date().toISOString().split("T")[0],
    solicitudServicio: searchParams.get("solicitudId") ? `SOL-2026-${searchParams.get("solicitudId")?.padStart(3, "0")}` : "",
    cliente: operacion?.cliente || searchParams.get("cliente") || "",
    comercial: operacion?.comercial || searchParams.get("comercial") || "",
    lineaProyecto: operacion?.lineaProyecto || "",
    fechaCondicion: operacion?.fechaCondicion || "",
    customerService: "",
    // Documento de Transporte
    transporteMaster: operacion?.blAwb || "",
    fechaDocTransporte: "",
    naviera: "",
    motonave: "",
    fechaEstimadaArribo: operacion?.fechaEstimadaLlegada || "",
    fechaLlegada: "",
    fechaAduana: "",
    fechaExpress: "",
    fechaIngreso: "",
    fechaDefinitivo: "",
    // Datos de Llegada
    deposito: "",
    // Muisca
    aceptacionMBL: "",
    fechaAceptacionMBL: "",
    // Cierre DO
    fechaEntregaDOContabilidad: "",
    fechaContabilidad: "",
    tipoOperacion: operacion?.tipoOperacion || searchParams.get("tipoOperacion") || "Importación",
    modoTransporte: operacion?.modoTransporte || searchParams.get("modoTransporte") || "Marítimo",
    estado: operacion?.estado || "Pendiente",
    origen: operacion?.origen || "",
    destino: operacion?.destino || "",
    valorUSD: operacion?.valorUSD?.toString() || "",
    peso: operacion?.peso?.toString() || "",
    volumen: operacion?.volumen?.toString() || "",
    contenedores: operacion?.contenedores?.toString() || "",
    tipoNegociacion: operacion?.tipoNegociacion || searchParams.get("tipoNegociacion") || "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/operaciones")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNew ? "Nueva Operación (DO)" : `Operación ${operacion?.consecutivo}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? "Documento de Operación - Apertura" : "Editar documento de operación"}
          </p>
        </div>
      </div>

      {/* Section 1: Datos Apertura DO */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sección: Datos Apertura DO</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Identificador Documento Importación</Label>
            <Input value={isNew ? "(Auto-generado)" : form.consecutivo} disabled className="bg-muted/50 h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Creación</Label>
            <Input type="date" value={form.fechaCreacion} onChange={e => update("fechaCreacion", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Solicitud de Servicio</Label>
            <Select value={form.solicitudServicio} onValueChange={v => update("solicitudServicio", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar solicitud..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL-2026-001">SOL-2026-001 - MABE</SelectItem>
                <SelectItem value="SOL-2026-002">SOL-2026-002 - INGERSOLL</SelectItem>
                <SelectItem value="SOL-2026-003">SOL-2026-003 - EMBAJADA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente</Label>
            <Select value={form.cliente} onValueChange={v => update("cliente", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
              <SelectContent>
                {mockClientes.map(c => (
                  <SelectItem key={c.id} value={c.razonSocial}>{c.razonSocial}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Comercial</Label>
            <Input value={form.comercial} disabled className="bg-muted/50 h-9" placeholder="(usuario actual)" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Línea de Proyecto</Label>
            <Input value={form.lineaProyecto} onChange={e => update("lineaProyecto", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Condición</Label>
            <Input type="date" value={form.fechaCondicion} onChange={e => update("fechaCondicion", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Customer Service</Label>
            <Select value={form.customerService} onValueChange={v => update("customerService", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar empleado..." /></SelectTrigger>
              <SelectContent>
                {mockUsuarios.filter(u => u.estado === "Activo").map(u => (
                  <SelectItem key={u.id} value={u.nombres + " " + u.apellidos}>{u.nombres} {u.apellidos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo Operación</Label>
            <Select value={form.tipoOperacion} onValueChange={v => update("tipoOperacion", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Importación">Importación</SelectItem>
                <SelectItem value="Exportación">Exportación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Modo Transporte</Label>
            <Select value={form.modoTransporte} onValueChange={v => update("modoTransporte", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Marítimo">Marítimo</SelectItem>
                <SelectItem value="Aéreo">Aéreo</SelectItem>
                <SelectItem value="Terrestre">Terrestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo Negociación</Label>
            <Select value={form.tipoNegociacion} onValueChange={v => update("tipoNegociacion", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Incoterm..." /></SelectTrigger>
              <SelectContent>
                {["DDP","CIP","EXW","FCA","FOB","CIF","CFR"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Documento de Transporte */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sección: Documento De Transporte</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">No. Documento Transporte Master (MBL/MAWB)</Label>
            <Input value={form.transporteMaster} onChange={e => update("transporteMaster", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Documento Transporte</Label>
            <Input type="date" value={form.fechaDocTransporte} onChange={e => update("fechaDocTransporte", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Naviera</Label>
            <Input value={form.naviera} onChange={e => update("naviera", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Motonave</Label>
            <Input value={form.motonave} onChange={e => update("motonave", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">ETA (Fecha Estimada Arribo)</Label>
            <Input type="date" value={form.fechaEstimadaArribo} onChange={e => update("fechaEstimadaArribo", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Llegada</Label>
            <Input type="date" value={form.fechaLlegada} onChange={e => update("fechaLlegada", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Aduana</Label>
            <Input type="date" value={form.fechaAduana} onChange={e => update("fechaAduana", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Express</Label>
            <Input type="date" value={form.fechaExpress} onChange={e => update("fechaExpress", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Ingreso</Label>
            <Input type="date" value={form.fechaIngreso} onChange={e => update("fechaIngreso", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Definitivo</Label>
            <Input type="date" value={form.fechaDefinitivo} onChange={e => update("fechaDefinitivo", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Datos De Llegada */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sección: Datos De Llegada</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Depósito</Label>
            <Select value={form.deposito} onValueChange={v => update("deposito", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar depósito..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALPOPULAR">ALMACÉN ALPOPULAR</SelectItem>
                <SelectItem value="SPR_BUN">SPR BUENAVENTURA</SelectItem>
                <SelectItem value="ALMAGRARIO">ALMAGRARIO</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Origen</Label>
            <Input value={form.origen} onChange={e => update("origen", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Destino</Label>
            <Input value={form.destino} onChange={e => update("destino", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Valor USD</Label>
            <Input type="number" value={form.valorUSD} onChange={e => update("valorUSD", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Peso (kg)</Label>
            <Input type="number" value={form.peso} onChange={e => update("peso", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Volumen (m³)</Label>
            <Input type="number" value={form.volumen} onChange={e => update("volumen", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contenedores</Label>
            <Input type="number" value={form.contenedores} onChange={e => update("contenedores", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Muisca */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sección: Muisca</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Aceptación MBL (1166)</Label>
            <Input value={form.aceptacionMBL} onChange={e => update("aceptacionMBL", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Aceptación MBL (1166)</Label>
            <Input type="date" value={form.fechaAceptacionMBL} onChange={e => update("fechaAceptacionMBL", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Cierre DO - Financiero */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sección: Cierre DO - Financiero</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Entrega DO Contabilidad</Label>
            <Input type="date" value={form.fechaEntregaDOContabilidad} onChange={e => update("fechaEntregaDOContabilidad", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Contabilidad</Label>
            <Input type="date" value={form.fechaContabilidad} onChange={e => update("fechaContabilidad", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pb-8">
        {isNew ? (
          <Button className="bg-accent hover:bg-accent-hover" onClick={() => toast("Registro generado exitosamente")}>
            <Save className="w-4 h-4 mr-2" />
            Insertar
          </Button>
        ) : (
          <>
            <Button className="bg-accent hover:bg-accent-hover" onClick={() => toast("Registro actualizado correctamente")}>
              <Save className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="secondary" onClick={() => {
              navigate(`/documentacion/instrucciones/nuevo?operacionId=${id}`);
              toast("Registro generado exitosamente");
            }}>
              <FileText className="w-4 h-4 mr-2" />
              Generar Instrucción de Embarque
            </Button>
          </>
        )}
        <Button variant="outline" onClick={() => navigate("/operaciones")}>
          <List className="w-4 h-4 mr-2" />
          Listado
        </Button>
      </div>
    </div>
  );
}
