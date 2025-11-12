import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar, 
  FileCheck, ChevronDown, ChevronUp 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineHitoProps {
  hito: {
    id: string;
    estado: string;
    fecha_plan?: string;
    fecha_real?: string;
    completado: boolean;
    sla_dias: number;
    responsable?: string;
    comentarios?: string;
    documentos: string[];
  };
  estadoLabel: string;
  isActual: boolean;
  isCompletado: boolean;
  isPendiente: boolean;
}

export function TimelineHito({ 
  hito, 
  estadoLabel, 
  isActual, 
  isCompletado, 
  isPendiente 
}: TimelineHitoProps) {
  const [expanded, setExpanded] = useState(isActual);

  const getSLAStatus = () => {
    if (hito.completado && hito.fecha_real && hito.fecha_plan) {
      const days = differenceInDays(
        new Date(hito.fecha_real), 
        new Date(hito.fecha_plan)
      );
      if (days <= 0) return { status: 'on-time', label: 'A tiempo' };
      if (days <= 2) return { status: 'warning', label: 'Leve retraso' };
      return { status: 'delayed', label: 'Retrasado' };
    }
    
    if (isActual && hito.fecha_plan) {
      const daysToDeadline = differenceInDays(
        new Date(hito.fecha_plan), 
        new Date()
      );
      if (daysToDeadline < 0) return { status: 'delayed', label: 'Vencido' };
      if (daysToDeadline <= 2) return { status: 'warning', label: 'Por vencer' };
      return { status: 'on-time', label: 'En plazo' };
    }
    
    return null;
  };

  const slaStatus = getSLAStatus();

  return (
    <div className="relative flex items-start gap-4 pl-10">
      {/* Círculo indicador */}
      <div className={cn(
        "absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all",
        isCompletado 
          ? 'bg-success border-success' 
          : isActual
          ? 'bg-primary border-primary animate-pulse'
          : 'bg-background border-border'
      )}>
        {isCompletado && <CheckCircle2 className="w-4 h-4 text-white" />}
        {isActual && <Clock className="w-4 h-4 text-primary-foreground" />}
      </div>

      {/* Contenido del hito */}
      <div className="flex-1 pb-4">
        <div 
          className={cn(
            "rounded-lg border transition-all",
            isActual && "border-primary bg-primary/5",
            isCompletado && "border-success/30 bg-success/5",
            isPendiente && "border-border bg-background"
          )}
        >
          {/* Header */}
          <div 
            className="p-4 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={cn(
                    "font-semibold text-base",
                    isCompletado || isActual ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {estadoLabel}
                  </h3>
                  {isCompletado && (
                    <Badge className="bg-success text-white">Completado</Badge>
                  )}
                  {isActual && (
                    <Badge className="bg-primary">En Proceso</Badge>
                  )}
                  {slaStatus && (
                    <Badge variant="outline" className={cn(
                      slaStatus.status === 'on-time' && "border-success text-success",
                      slaStatus.status === 'warning' && "border-amber-500 text-amber-500",
                      slaStatus.status === 'delayed' && "border-destructive text-destructive"
                    )}>
                      {slaStatus.status === 'delayed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {slaStatus.label}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {hito.fecha_plan && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Plan: {format(new Date(hito.fecha_plan), "dd MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                  {hito.fecha_real && (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Real: {format(new Date(hito.fecha_real), "dd MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                  {hito.sla_dias > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>SLA: {hito.sla_dias} días</span>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="sm">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Contenido expandido */}
          {expanded && (
            <div className="px-4 pb-4 border-t space-y-3">
              {hito.responsable && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Responsable</p>
                  <p className="text-sm font-medium">{hito.responsable}</p>
                </div>
              )}

              {hito.comentarios && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Comentarios</p>
                  <p className="text-sm">{hito.comentarios}</p>
                </div>
              )}

              {hito.documentos && hito.documentos.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Documentos requeridos ({hito.documentos.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hito.documentos.map((doc, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {isActual && (
                <div className="pt-2">
                  <Button size="sm" className="w-full">
                    Completar Etapa
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
