import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMudanzas() {
  return useQuery({
    queryKey: ["mudanzas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mudanzas")
        .select(`
          *,
          cliente:clientes(*),
          agente:agentes(*),
          coordinador:profiles(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useMudanza(id: string) {
  return useQuery({
    queryKey: ["mudanza", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mudanzas")
        .select(`
          *,
          cliente:clientes(*),
          agente:agentes(*),
          coordinador:profiles(*),
          hitos(*),
          inventario(*),
          documentos(*),
          costos(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
