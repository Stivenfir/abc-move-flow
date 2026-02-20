import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List } from "lucide-react";
import { mockClientes, mockUsuarios } from "@/lib/logisticsData";

// Reuse the mock from Solicitudes page inline
const mockSolicitudes = [
  { id: "1", consecutivo: "SOL-2026-001", cliente: "MABE COLOMBIA SAS", lineaProyecto: "CORPORATIVO" as const, comercial: "Carlos Mendoza", servicioNombre: "FCL Import", tipoMercancia: "CARGA GENERAL", fechaCondicion: "2026-02-15", tipoOperacion: "Importación" as const, modoTransporte: "Marítimo" as const, activa: true, tipoNegociacion: "CIF", cancelado: false, cerrado: false, division: "CI" as const, generador: "Propio" as const, clase: "A", fechaCreacion: "2026-01-20" },
  { id: "2", consecutivo: "SOL-2026-002", cliente: "INGERSOLL - RAND COLOMBIA SAS", lineaProyecto: "PROYECTO" as const, comercial: "Ana García", servicioNombre: "LCL Export", tipoMercancia: "REPUESTO", fechaCondicion: "2026-02-01", tipoOperacion: "Exportación" as const, modoTransporte: "Marítimo" as const, activa: true, tipoNegociacion: "FOB", cancelado: false, cerrado: false, division: "CE" as const, generador: "Tercero" as const, clase: "B", fechaCreacion: "2026-01-15" },
  { id: "3", consecutivo: "SOL-2026-003", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS", lineaProyecto: "CORPORATIVO" as const, comercial: "Carlos Mendoza", servicioNombre: "Air Freight", tipoMercancia: "BULTO", fechaCondicion: "2026-02-10", tipoOperacion: "Importación" as const, modoTransporte: "Aéreo" as const, activa: true, tipoNegociacion: "DDP", cancelado: false, cerrado: false, division: "CI" as const, generador: "Propio" as const, clase: "A", fechaCreacion: "2026-02-01" },
];

export default function SolicitudDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sol = mockSolicitudes.find(s => s.id === id);

  if (!sol) {
    return (
      <div className="container-dashboard py-12 text-center">
        <p className="text-muted-foreground">Solicitud no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/comercial/solicitudes")}>Volver al listado</Button>
      </div>
    );
  }

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/comercial/solicitudes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Solicitud {sol.consecutivo}</h1>
          <p className="text-sm text-muted-foreground">Detalle de solicitud de servicio</p>
        </div>
        <Badge className="ml-auto" variant={sol.cancelado ? "destructive" : sol.cerrado ? "secondary" : "default"}>
          {sol.cancelado ? "Cancelado" : sol.cerrado ? "Cerrado" : "Abierto"}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información de la Solicitud</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Identificador", sol.consecutivo, true],
            ["Fecha Creación", sol.fechaCreacion, true],
            ["Cliente", sol.cliente, false],
            ["Línea Proyecto", sol.lineaProyecto, false],
            ["Comercial", sol.comercial, false],
            ["Servicio Nombre", sol.servicioNombre, false],
            ["Tipo Mercancía", sol.tipoMercancia, false],
            ["Fecha Condición", sol.fechaCondicion, false],
            ["Tipo Operación", sol.tipoOperacion, false],
            ["Modo Transporte", sol.modoTransporte, false],
            ["Tipo Negociación", sol.tipoNegociacion, false],
            ["División", sol.division, false],
            ["Generador", sol.generador, false],
            ["Activa", sol.activa ? "Sí" : "No", true],
            ["Cerrado", sol.cerrado ? "Sí" : "No", true],
            ["Cancelado", sol.cancelado ? "Sí" : "No", true],
            ["Clase", sol.clase, false],
          ].map(([label, value, disabled]) => (
            <div key={label as string} className="space-y-1.5">
              <Label className="text-xs">{label as string}</Label>
              <Input value={value as string} disabled={disabled as boolean} className={`h-9 ${disabled ? "bg-muted/50" : ""}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pb-8">
        <Button className="bg-accent hover:bg-accent-hover">
          <Save className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
        <Button variant="outline" onClick={() => navigate("/comercial/solicitudes")}>
          <List className="w-4 h-4 mr-2" />
          Listado
        </Button>
      </div>
    </div>
  );
}
