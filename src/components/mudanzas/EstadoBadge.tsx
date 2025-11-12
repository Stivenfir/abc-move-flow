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
  booking: { label: "Booking", variant: "bg-status-in-progress text-white" },
  empaque: { label: "Empaque", variant: "bg-purple-500 text-white" },
  bodega: { label: "Bodega", variant: "bg-amber-500 text-white" },
  despacho: { label: "Despacho", variant: "bg-indigo-500 text-white" },
  transito: { label: "Tránsito", variant: "bg-cyan-500 text-white" },
  aduana: { label: "Aduana", variant: "bg-orange-500 text-white" },
  entrega: { label: "Entrega", variant: "bg-green-500 text-white" },
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
