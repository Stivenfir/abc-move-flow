import { Badge } from "@/components/ui/badge";
import { EstadoMudanza } from "@/types/mudanza";
import { cn } from "@/lib/utils";

interface EstadoBadgeProps {
  estado: EstadoMudanza;
  className?: string;
}

const estadoConfig: Record<EstadoMudanza, { label: string; variant: string }> = {
  inspeccion: { label: "Inspección", variant: "bg-status-pending text-white" },
  cotizacion: { label: "Cotización", variant: "bg-blue-500 text-white" },
  cotizacion_enviada: { label: "Cotización Enviada", variant: "bg-blue-600 text-white" },
  cotizacion_aceptada: { label: "Cotización Aceptada", variant: "bg-green-600 text-white" },
  booking: { label: "Booking", variant: "bg-status-in-progress text-white" },
  booking_solicitado: { label: "Booking Solicitado", variant: "bg-yellow-500 text-white" },
  booking_confirmado: { label: "Booking Confirmado", variant: "bg-green-500 text-white" },
  programacion_empaque: { label: "Programación Empaque", variant: "bg-purple-400 text-white" },
  empaque: { label: "Empaque", variant: "bg-purple-500 text-white" },
  bodega: { label: "Bodega", variant: "bg-amber-500 text-white" },
  despacho: { label: "Despacho", variant: "bg-indigo-500 text-white" },
  traslado_puerto: { label: "Traslado a Puerto", variant: "bg-indigo-600 text-white" },
  exportacion_completa: { label: "Exportación Completa", variant: "bg-teal-500 text-white" },
  transito: { label: "Tránsito", variant: "bg-cyan-500 text-white" },
  en_transito_internacional: { label: "Tránsito Internacional", variant: "bg-cyan-600 text-white" },
  arribado_puerto: { label: "Arribado a Puerto", variant: "bg-lime-500 text-white" },
  aduana: { label: "Aduana", variant: "bg-orange-500 text-white" },
  en_proceso_aduanas: { label: "En Proceso Aduanas", variant: "bg-orange-600 text-white" },
  levante_aprobado: { label: "Levante Aprobado", variant: "bg-emerald-500 text-white" },
  programando_entrega: { label: "Programando Entrega", variant: "bg-green-400 text-white" },
  entrega: { label: "Entrega", variant: "bg-green-500 text-white" },
  contenedor_devuelto: { label: "Contenedor Devuelto", variant: "bg-teal-600 text-white" },
  cerrado: { label: "Cerrado", variant: "bg-gray-500 text-white" },
};

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const config = estadoConfig[estado];
  
  return (
    <Badge className={cn("status-badge", config.variant, className)}>
      {config.label}
    </Badge>
  );
}
