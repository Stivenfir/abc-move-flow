import { Badge } from "@/components/ui/badge";
import { TipoOperacion } from "@/types/mudanza";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface TipoOperacionBadgeProps {
  tipo: TipoOperacion;
  className?: string;
}

export function TipoOperacionBadge({ tipo, className }: TipoOperacionBadgeProps) {
  const config = {
    exportacion: {
      label: "Exportación",
      icon: ArrowUpRight,
      variant: "bg-blue-500 text-white"
    },
    importacion: {
      label: "Importación",
      icon: ArrowDownLeft,
      variant: "bg-green-500 text-white"
    }
  };

  const { label, icon: Icon, variant } = config[tipo];

  return (
    <Badge className={`${variant} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
