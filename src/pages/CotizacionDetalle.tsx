import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, FileSpreadsheet, Search, FileText } from "lucide-react";
import { mockCotizaciones, mockClientes } from "@/lib/logisticsData";
import { toast } from "sonner";

interface LineaCargo {
  id: string;
  concepto: string;
  valor: number;
  moneda: string;
  proveedor: string;
  nota: string;
}

export default function CotizacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cotizacion = id ? mockCotizaciones.find(c => c.id === id) : null;

  const [form, setForm] = useState({
    noCotizacion: cotizacion?.consecutivo || "",
    numeroOportunidad: "",
    activo: true,
    fechaCreacion: cotizacion?.fechaCreacion || new Date().toISOString().split("T")[0],
    fechaValidezDesde: cotizacion?.fechaCreacion || "",
    fechaValidezHasta: cotizacion?.fechaVencimiento || "",
    // Info cliente
    cliente: cotizacion?.cliente || "",
    contactoNombre: "",
    contactoEmail: "",
    // Características carga
    modo: cotizacion?.modoTransporte === "Marítimo" ? "FCL" : cotizacion?.modoTransporte === "Aéreo" ? "Aéreo" : "LCL",
    bultosCajas: "",
    volumen: "",
    largo: "",
    ancho: "",
    alto: "",
    pesoKilogramo: "",
    cargaEstibable: true,
    producto: cotizacion?.tipoMercancia || "",
    valorEmbarque: cotizacion?.valorUSD?.toString() || "",
    monedaEmbarque: "USD",
    paisOrigen: "",
    paisDestino: "",
    diasLibresDestino: "",
    tiempoTransito: "",
    ruta: cotizacion ? `${cotizacion.origen} → ${cotizacion.destino}` : "",
  });

  const [lineas, setLineas] = useState<LineaCargo[]>([
    { id: "1", concepto: "Flete Internacional", valor: 2500, moneda: "USD", proveedor: "MAERSK LINE", nota: "" },
    { id: "2", concepto: "Handling", valor: 350, moneda: "USD", proveedor: "", nota: "Manejo local" },
    { id: "3", concepto: "Documentación", valor: 150, moneda: "USD", proveedor: "", nota: "" },
  ]);

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const addLinea = () => {
    setLineas(prev => [...prev, { id: String(Date.now()), concepto: "", valor: 0, moneda: "USD", proveedor: "", nota: "" }]);
  };

  const updateLinea = (id: string, field: keyof LineaCargo, value: string | number) => {
    setLineas(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const generarSolicitud = () => {
    toast.success("Solicitud de servicio generada desde cotización " + form.noCotizacion);
    navigate("/comercial/solicitudes");
  };

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cotizaciones")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cotización {cotizacion?.consecutivo || "Nueva"}</h1>
          <p className="text-sm text-muted-foreground">Detalle y gestión de cotización</p>
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader><CardTitle className="text-base">Información General</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">NoCotizacion</Label>
            <Input value={form.noCotizacion} disabled className="bg-muted/50 h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Numero de Oportunidad</Label>
            <Input value={form.numeroOportunidad} onChange={e => update("numeroOportunidad", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Activo</Label>
            <Select value={form.activo ? "Si" : "No"} onValueChange={v => update("activo", v === "Si")}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Si">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Creación</Label>
            <Input type="date" value={form.fechaCreacion} onChange={e => update("fechaCreacion", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Validez Desde</Label>
            <Input type="date" value={form.fechaValidezDesde} onChange={e => update("fechaValidezDesde", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha Validez Hasta</Label>
            <Input type="date" value={form.fechaValidezHasta} onChange={e => update("fechaValidezHasta", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Información Del Cliente */}
      <Card>
        <CardHeader><CardTitle className="text-base">Información Del Cliente</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente</Label>
            <Select value={form.cliente} onValueChange={v => update("cliente", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {mockClientes.map(c => (
                  <SelectItem key={c.id} value={c.razonSocial}>{c.razonSocial}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contacto Nombre</Label>
            <Input value={form.contactoNombre} onChange={e => update("contactoNombre", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contacto Email</Label>
            <Input type="email" value={form.contactoEmail} onChange={e => update("contactoEmail", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Características De La Carga */}
      <Card>
        <CardHeader><CardTitle className="text-base">Características De La Carga</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Modo</Label>
            <Select value={form.modo} onValueChange={v => update("modo", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FCL">FCL</SelectItem>
                <SelectItem value="LCL">LCL</SelectItem>
                <SelectItem value="Aéreo">Aéreo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Bultos-Cajas</Label>
            <Input value={form.bultosCajas} onChange={e => update("bultosCajas", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Volumen (m³)</Label>
            <Input type="number" value={form.volumen} onChange={e => update("volumen", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Largo (cm)</Label>
            <Input type="number" value={form.largo} onChange={e => update("largo", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ancho (cm)</Label>
            <Input type="number" value={form.ancho} onChange={e => update("ancho", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Alto (cm)</Label>
            <Input type="number" value={form.alto} onChange={e => update("alto", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Peso Kilogramo</Label>
            <Input type="number" value={form.pesoKilogramo} onChange={e => update("pesoKilogramo", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Carga Estibable</Label>
            <Select value={form.cargaEstibable ? "Si" : "No"} onValueChange={v => update("cargaEstibable", v === "Si")}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Si">Sí</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Producto</Label>
            <Input value={form.producto} onChange={e => update("producto", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Valor del Embarque</Label>
            <Input type="number" value={form.valorEmbarque} onChange={e => update("valorEmbarque", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Moneda del Embarque</Label>
            <Select value={form.monedaEmbarque} onValueChange={v => update("monedaEmbarque", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">País Origen</Label>
            <Input value={form.paisOrigen} onChange={e => update("paisOrigen", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">País Destino</Label>
            <Input value={form.paisDestino} onChange={e => update("paisDestino", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Días Libres en Destino</Label>
            <Input type="number" value={form.diasLibresDestino} onChange={e => update("diasLibresDestino", e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tiempo Tránsito</Label>
            <Input value={form.tiempoTransito} onChange={e => update("tiempoTransito", e.target.value)} className="h-9" placeholder="ej: 25 días" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ruta</Label>
            <Input value={form.ruta} onChange={e => update("ruta", e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Cotización Detalle Cargo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Cotización Detalle Cargo</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={addLinea}>
                <Plus className="w-3 h-3 mr-1" />Nuevo
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="w-3 h-3 mr-1" />Excel
              </Button>
              <Button variant="outline" size="sm">
                <Search className="w-3 h-3 mr-1" />Consultar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineas.map(l => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Input value={l.concepto} onChange={e => updateLinea(l.id, "concepto", e.target.value)} className="h-8 text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={l.valor} onChange={e => updateLinea(l.id, "valor", Number(e.target.value))} className="h-8 text-sm text-right" />
                  </TableCell>
                  <TableCell>
                    <Select value={l.moneda} onValueChange={v => updateLinea(l.id, "moneda", v)}>
                      <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input value={l.proveedor} onChange={e => updateLinea(l.id, "proveedor", e.target.value)} className="h-8 text-sm" />
                  </TableCell>
                  <TableCell>
                    <Input value={l.nota} onChange={e => updateLinea(l.id, "nota", e.target.value)} className="h-8 text-sm" />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">${lineas.reduce((s, l) => s + l.valor, 0).toLocaleString()}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover">
          <Save className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
        <Button variant="secondary" onClick={generarSolicitud}>
          <FileText className="w-4 h-4 mr-2" />
          Generar Solicitud de Servicio
        </Button>
        <Button variant="outline" onClick={() => navigate("/cotizaciones")}>
          Listado
        </Button>
      </div>
    </div>
  );
}
