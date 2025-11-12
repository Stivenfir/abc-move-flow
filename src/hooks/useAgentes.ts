import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";

export interface AgentWithStats {
  id: string;
  nombre: string;
  pais: string;
  ciudad: string;
  network: string | null;
  status: string | null;
  rating: number | null;
  activo: boolean | null;
  cobertura: string[] | null;
  certificaciones: string[] | null;
  mudanzas_completadas: number | null;
  tasa_cumplimiento: number | null;
  sla_dias: number | null;
  contacto_email: string | null;
  contacto_telefono: string | null;
  stats?: {
    bookings: number;
    m3_total: number;
    on_time_pct: number;
    doc_ok_pct: number;
    nps_avg: number;
    claims_per_100: number;
    revenue: number;
    gross_margin: number;
  };
  reciprocity?: {
    sent_services: number;
    received_services: number;
    reciprocity_ratio: number;
  };
  financials?: {
    ar_total: number;
    ap_total: number;
    net_balance: number;
    ar_aging: Record<string, number>;
  };
}

export function useAgentes(filters?: {
  network?: string[];
  pais?: string;
  ciudad?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  return useQuery({
    queryKey: ["agentes", filters],
    queryFn: async () => {
      let query = supabase.from("agentes").select("*");

      if (filters?.network && filters.network.length > 0) {
        query = query.in("network", filters.network);
      }
      if (filters?.pais) {
        query = query.eq("pais", filters.pais);
      }
      if (filters?.ciudad) {
        query = query.eq("ciudad", filters.ciudad);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      query = query.order("rating", { ascending: false });

      const { data: agentes, error } = await query;
      if (error) throw error;

      // Fetch stats for each agent
      const dateFrom = filters?.dateFrom || subMonths(new Date(), 12);
      const dateTo = filters?.dateTo || new Date();

      const agentesWithStats = await Promise.all(
        (agentes || []).map(async (agente) => {
          // Get aggregated stats
          const { data: stats } = await supabase
            .from("agent_stats")
            .select("*")
            .eq("agent_id", agente.id)
            .gte("period", format(dateFrom, "yyyy-MM-dd"))
            .lte("period", format(dateTo, "yyyy-MM-dd"));

          // Get reciprocity
          const { data: reciprocity } = await supabase
            .from("agent_reciprocity")
            .select("*")
            .eq("agent_id", agente.id)
            .gte("period", format(dateFrom, "yyyy-MM-dd"))
            .lte("period", format(dateTo, "yyyy-MM-dd"));

          // Get financials
          const { data: financials } = await supabase
            .from("agent_financials")
            .select("*")
            .eq("agent_id", agente.id)
            .order("period", { ascending: false })
            .limit(1)
            .single();

          // Aggregate stats
          const aggregatedStats = stats?.reduce(
            (acc, stat) => ({
              bookings: acc.bookings + (stat.bookings || 0),
              m3_total: acc.m3_total + Number(stat.m3_total || 0),
              revenue: acc.revenue + Number(stat.revenue || 0),
              gross_margin: acc.gross_margin + Number(stat.gross_margin || 0),
              on_time_pct:
                (acc.on_time_pct * acc.count + Number(stat.on_time_pct || 0)) /
                (acc.count + 1),
              doc_ok_pct:
                (acc.doc_ok_pct * acc.count + Number(stat.doc_ok_pct || 0)) /
                (acc.count + 1),
              nps_avg:
                (acc.nps_avg * acc.count + Number(stat.nps_avg || 0)) /
                (acc.count + 1),
              claims_per_100:
                (acc.claims_per_100 * acc.count +
                  Number(stat.claims_per_100 || 0)) /
                (acc.count + 1),
              count: acc.count + 1,
            }),
            {
              bookings: 0,
              m3_total: 0,
              revenue: 0,
              gross_margin: 0,
              on_time_pct: 0,
              doc_ok_pct: 0,
              nps_avg: 0,
              claims_per_100: 0,
              count: 0,
            }
          );

          // Aggregate reciprocity
          const aggregatedReciprocity = reciprocity?.reduce(
            (acc, rec) => ({
              sent_services: acc.sent_services + (rec.sent_services || 0),
              received_services:
                acc.received_services + (rec.received_services || 0),
              reciprocity_ratio:
                rec.received_services && rec.sent_services
                  ? rec.received_services / rec.sent_services
                  : 0,
            }),
            { sent_services: 0, received_services: 0, reciprocity_ratio: 0 }
          );

          return {
            ...agente,
            stats: aggregatedStats
              ? {
                  bookings: aggregatedStats.bookings,
                  m3_total: aggregatedStats.m3_total,
                  on_time_pct: aggregatedStats.on_time_pct,
                  doc_ok_pct: aggregatedStats.doc_ok_pct,
                  nps_avg: aggregatedStats.nps_avg,
                  claims_per_100: aggregatedStats.claims_per_100,
                  revenue: aggregatedStats.revenue,
                  gross_margin: aggregatedStats.gross_margin,
                }
              : undefined,
            reciprocity: aggregatedReciprocity,
            financials: financials
              ? {
                  ar_total: Number(financials.ar_total || 0),
                  ap_total: Number(financials.ap_total || 0),
                  net_balance: Number(financials.net_balance || 0),
                  ar_aging: financials.ar_aging as Record<string, number>,
                }
              : undefined,
          };
        })
      );

      return agentesWithStats as AgentWithStats[];
    },
  });
}

export function useAgente(id: string) {
  return useQuery({
    queryKey: ["agente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agentes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch related data
      const [statsRes, reciprocityRes, financialsRes, lanesRes, mudanzasRes] =
        await Promise.all([
          supabase
            .from("agent_stats")
            .select("*")
            .eq("agent_id", id)
            .order("period", { ascending: false })
            .limit(12),
          supabase
            .from("agent_reciprocity")
            .select("*")
            .eq("agent_id", id)
            .order("period", { ascending: false })
            .limit(12),
          supabase
            .from("agent_financials")
            .select("*")
            .eq("agent_id", id)
            .order("period", { ascending: false })
            .limit(1)
            .single(),
          supabase.from("agent_lanes").select("*").eq("agent_id", id),
          supabase
            .from("shipment_moves")
            .select("*, mudanza:mudanzas(*, cliente:clientes(*))")
            .eq("agent_id", id),
        ]);

      return {
        ...data,
        stats: statsRes.data || [],
        reciprocity: reciprocityRes.data || [],
        financials: financialsRes.data,
        lanes: lanesRes.data || [],
        mudanzas: mudanzasRes.data || [],
      };
    },
    enabled: !!id,
  });
}
