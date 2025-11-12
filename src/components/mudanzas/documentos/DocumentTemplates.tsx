import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Plane, Ship, FileCheck, 
  Building2, Shield, Package 
} from "lucide-react";

const templates = [
  {
    id: "packing-list",
    nombre: "Packing List",
    descripcion: "Lista detallada de items con fotos y QR",
    icon: Package,
    color: "bg-blue-500",
    categoria: "Empaque"
  },
  {
    id: "bill-of-lading",
    nombre: "Bill of Lading (BL)",
    descripcion: "Conocimiento de embarque marítimo",
    icon: Ship,
    color: "bg-cyan-500",
    categoria: "Transporte"
  },
  {
    id: "air-waybill",
    nombre: "Air Waybill (AWB)",
    descripcion: "Guía aérea internacional",
    icon: Plane,
    color: "bg-indigo-500",
    categoria: "Transporte"
  },
  {
    id: "carta-instrucciones",
    nombre: "Carta de Instrucciones",
    descripcion: "Instrucciones para agente destino",
    icon: FileText,
    color: "bg-purple-500",
    categoria: "Comunicación"
  },
  {
    id: "declaracion-aduana",
    nombre: "Declaración Aduanera",
    descripcion: "Documentos para liberación aduanal",
    icon: FileCheck,
    color: "bg-green-500",
    categoria: "Aduana"
  },
  {
    id: "carta-diplomatica",
    nombre: "Carta Diplomática",
    descripcion: "Solicitud de exención diplomática",
    icon: Shield,
    color: "bg-amber-500",
    categoria: "Especial"
  },
  {
    id: "contrato-guarda",
    nombre: "Contrato de Guarda",
    descripción: "Contrato de almacenamiento en bodega",
    icon: Building2,
    color: "bg-orange-500",
    categoria: "Bodega"
  },
  {
    id: "hoja-entrega",
    nombre: "Hoja de Entrega",
    descripcion: "Conformidad y firma del cliente final",
    icon: FileCheck,
    color: "bg-teal-500",
    categoria: "Entrega"
  }
];

export function DocumentTemplates() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Plantillas Disponibles</h3>
        <p className="text-sm text-muted-foreground">
          Documentos que se pueden generar automáticamente
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{template.nombre}</h4>
                      <Badge variant="outline" className="text-xs">
                        {template.categoria}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.descripcion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
