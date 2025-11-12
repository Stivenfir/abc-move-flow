import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventoData {
  mudanzaId: string;
  tipo: string;
  categoria: 'sistema' | 'usuario' | 'automatico';
  descripcion: string;
  datos_previos?: any;
  datos_nuevos?: any;
}

export function useRegistrarEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evento: EventoData) => {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      
      let usuarioNombre = "Sistema";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          usuarioNombre = profile.nombre_completo;
        }
      }

      const { data, error } = await supabase
        .from("mudanza_eventos")
        .insert({
          mudanza_id: evento.mudanzaId,
          tipo: evento.tipo,
          categoria: evento.categoria,
          descripcion: evento.descripcion,
          datos_previos: evento.datos_previos,
          datos_nuevos: evento.datos_nuevos,
          usuario_id: user?.id,
          usuario_nombre: usuarioNombre,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["eventos", variables.mudanzaId] });
      queryClient.invalidateQueries({ queryKey: ["auditoria", variables.mudanzaId] });
    },
    onError: (error) => {
      console.error("Error al registrar evento:", error);
      toast.error("Error al registrar evento");
    },
  });
}
