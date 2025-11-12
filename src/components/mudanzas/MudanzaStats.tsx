import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target, TrendingUp, Calendar } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";

interface Hito {
  id: string;
  estado: string;
  fecha_plan?: string;
  fecha_real?: string;
  completado: boolean;
  sla_dias: number;
}

interface MudanzaStatsProps {
  hitos: Hito[];
  fechaCreacion: string;
  fechaEstimada?: string;
}

export function MudanzaStats({ hitos, fechaCreacion, fechaEstimada }: MudanzaStatsProps) {
  const calcularStats = () => {
    const total = hitos.length;
    const completados = hitos.filter(h => h.completado).length;
    const progreso = total > 0 ? Math.round((completados / total) * 100) : 0;

    // Calcular cumplimiento SLA
    const hitosConFechas = hitos.filter(h => h.completado && h.fecha_real && h.fecha_plan);
    const hitosATiempo = hitosConFechas.filter(h => {
      if (h.fecha_real && h.fecha_plan) {
        return differenceInDays(new Date(h.fecha_real), new Date(h.fecha_plan)) <= 0;
      }
      return false;
    });
    const cumplimientoSLA = hitosConFechas.length > 0 
      ? Math.round((hitosATiempo.length / hitosConFechas.length) * 100)
      : 100;

    // Días transcurridos
    const diasTranscurridos = differenceInDays(new Date(), new Date(fechaCreacion));

    // Días restantes hasta fecha estimada
    const diasRestantes = fechaEstimada 
      ? differenceInDays(new Date(fechaEstimada), new Date())
      : null;

    return { progreso, cumplimientoSLA, diasTranscurridos, diasRestantes };
  };

  const stats = calcularStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.progreso}%</p>
              <p className="text-xs text-muted-foreground">Progreso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              stats.cumplimientoSLA >= 80 
                ? 'bg-success/10' 
                : stats.cumplimientoSLA >= 60 
                ? 'bg-amber-500/10' 
                : 'bg-destructive/10'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                stats.cumplimientoSLA >= 80 
                  ? 'text-success' 
                  : stats.cumplimientoSLA >= 60 
                  ? 'text-amber-500' 
                  : 'text-destructive'
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cumplimientoSLA}%</p>
              <p className="text-xs text-muted-foreground">SLA Cumplido</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.diasTranscurridos}</p>
              <p className="text-xs text-muted-foreground">Días activa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              stats.diasRestantes && stats.diasRestantes < 0 
                ? 'bg-destructive/10' 
                : stats.diasRestantes && stats.diasRestantes <= 5 
                ? 'bg-amber-500/10' 
                : 'bg-success/10'
            }`}>
              <Calendar className={`w-5 h-5 ${
                stats.diasRestantes && stats.diasRestantes < 0 
                  ? 'text-destructive' 
                  : stats.diasRestantes && stats.diasRestantes <= 5 
                  ? 'text-amber-500' 
                  : 'text-success'
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.diasRestantes !== null 
                  ? stats.diasRestantes > 0 
                    ? stats.diasRestantes 
                    : 'Vencida'
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.diasRestantes !== null && stats.diasRestantes > 0 ? 'Días restantes' : 'Fecha estimada'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
