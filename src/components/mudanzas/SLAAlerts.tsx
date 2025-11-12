import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock, CheckCircle2, FileWarning } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Hito {
  id: string;
  estado: string;
  fecha_plan?: string;
  fecha_real?: string;
  completado: boolean;
  sla_dias: number;
  documentos: string[];
}

interface SLAAlertsProps {
  hitos: Hito[];
  estadoActual: string;
}

export function SLAAlerts({ hitos, estadoActual }: SLAAlertsProps) {
  const getAlerts = () => {
    const alerts: Array<{
      type: 'error' | 'warning' | 'info';
      icon: React.ReactNode;
      message: string;
    }> = [];

    // Verificar hito actual
    const hitoActual = hitos.find(h => h.estado === estadoActual);
    if (hitoActual && hitoActual.fecha_plan) {
      const daysToDeadline = differenceInDays(
        new Date(hitoActual.fecha_plan),
        new Date()
      );

      if (daysToDeadline < 0) {
        alerts.push({
          type: 'error',
          icon: <AlertTriangle className="w-4 h-4" />,
          message: `La etapa "${hitoActual.estado}" está vencida por ${Math.abs(daysToDeadline)} días`
        });
      } else if (daysToDeadline <= 2) {
        alerts.push({
          type: 'warning',
          icon: <Clock className="w-4 h-4" />,
          message: `La etapa "${hitoActual.estado}" vence en ${daysToDeadline} días`
        });
      }

      // Verificar documentos faltantes
      if (hitoActual.documentos && hitoActual.documentos.length > 0) {
        alerts.push({
          type: 'info',
          icon: <FileWarning className="w-4 h-4" />,
          message: `${hitoActual.documentos.length} documentos pendientes para esta etapa`
        });
      }
    }

    // Contar hitos completados a tiempo
    const hitosCompletados = hitos.filter(h => h.completado);
    const hitosAtrasados = hitosCompletados.filter(h => {
      if (h.fecha_real && h.fecha_plan) {
        return differenceInDays(new Date(h.fecha_real), new Date(h.fecha_plan)) > 0;
      }
      return false;
    });

    if (hitosAtrasados.length > 0) {
      alerts.push({
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        message: `${hitosAtrasados.length} etapas completadas con retraso`
      });
    }

    // Calcular cumplimiento de SLA
    if (hitosCompletados.length > 0) {
      const cumplimientoSLA = Math.round(
        ((hitosCompletados.length - hitosAtrasados.length) / hitosCompletados.length) * 100
      );
      
      if (cumplimientoSLA === 100) {
        alerts.push({
          type: 'info',
          icon: <CheckCircle2 className="w-4 h-4" />,
          message: `Excelente: 100% de cumplimiento de SLA hasta ahora`
        });
      }
    }

    return alerts;
  };

  const alerts = getAlerts();

  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            variant={alert.type === 'error' ? 'destructive' : 'default'}
            className={
              alert.type === 'warning' 
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' 
                : alert.type === 'info'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : ''
            }
          >
            <div className="flex items-center gap-2">
              {alert.icon}
              <AlertDescription className="font-medium">
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
