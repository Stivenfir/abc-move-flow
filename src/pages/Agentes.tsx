import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useAgentes } from "@/hooks/useAgentes";
import { AgentKPICard } from "@/components/agentes/AgentKPICard";
import { AgentCard } from "@/components/agentes/AgentCard";
import { AgentFilters } from "@/components/agentes/AgentFilters";

export default function Agentes() {
  const [filters, setFilters] = useState({
    network: [] as string[],
    pais: "",
    ciudad: "",
    status: "all",
    search: "",
  });

  const { data: agentes, isLoading } = useAgentes({
    network: filters.network.length > 0 ? filters.network : undefined,
    pais: filters.pais || undefined,
    ciudad: filters.ciudad || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
  });

  // Filter by search
  const filteredAgentes = agentes?.filter((agent) =>
    filters.search
      ? agent.nombre.toLowerCase().includes(filters.search.toLowerCase())
      : true
  );

  // Calculate global KPIs
  const globalKPIs = agentes?.reduce(
    (acc, agent) => ({
      activeAgents:
        acc.activeAgents + (agent.status === "active" ? 1 : 0),
      totalBookings: acc.totalBookings + (agent.stats?.bookings || 0),
      totalM3: acc.totalM3 + (agent.stats?.m3_total || 0),
      totalMargin: acc.totalMargin + (agent.stats?.gross_margin || 0),
      avgOnTime:
        (acc.avgOnTime * acc.count + (agent.stats?.on_time_pct || 0)) /
        (acc.count + 1),
      avgNPS:
        (acc.avgNPS * acc.count + (agent.stats?.nps_avg || 0)) /
        (acc.count + 1),
      count: acc.count + 1,
    }),
    {
      activeAgents: 0,
      totalBookings: 0,
      totalM3: 0,
      totalMargin: 0,
      avgOnTime: 0,
      avgNPS: 0,
      count: 0,
    }
  ) || {
    activeAgents: 0,
    totalBookings: 0,
    totalM3: 0,
    totalMargin: 0,
    avgOnTime: 0,
    avgNPS: 0,
    count: 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container-dashboard space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agentes Internacionales</h1>
            <p className="text-muted-foreground">
              Red global de partners certificados
            </p>
          </div>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Agente
          </Button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AgentKPICard
            title="Agentes Activos"
            value={globalKPIs.activeAgents}
            icon={Users}
          />
          <AgentKPICard
            title="Mudanzas con Agentes"
            value={globalKPIs.totalBookings}
            icon={Package}
          />
          <AgentKPICard
            title="Volumen Total (m³)"
            value={globalKPIs.totalM3.toFixed(1)}
            icon={TrendingUp}
          />
          <AgentKPICard
            title="Margen Total"
            value={`$${globalKPIs.totalMargin.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AgentKPICard
            title="On-time % Global"
            value={`${globalKPIs.avgOnTime.toFixed(1)}%`}
            icon={AlertCircle}
          />
          <AgentKPICard
            title="NPS Promedio"
            value={globalKPIs.avgNPS.toFixed(1)}
            icon={ThumbsUp}
          />
          <AgentKPICard
            title="Total Agentes"
            value={agentes?.length || 0}
            icon={Users}
          />
        </div>

        {/* Filters */}
        <AgentFilters filters={filters} onChange={setFilters} />

        {/* Agent Cards */}
        <div className="space-y-4">
          {filteredAgentes && filteredAgentes.length > 0 ? (
            filteredAgentes.map((agente) => (
              <AgentCard key={agente.id} agent={agente} />
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron agentes
              </h3>
              <p className="text-muted-foreground mb-4">
                Ajusta los filtros o agrega nuevos agentes a tu red
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Agente
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
