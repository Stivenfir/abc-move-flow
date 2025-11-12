import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientifySyncData {
  numero: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    tipo: string;
  };
  origen_pais: string;
  origen_ciudad: string;
  destino_pais: string;
  destino_ciudad: string;
  tipo: string;
  modo: string;
  fecha_estimada?: string;
  volumen_estimado?: number;
  peso_estimado?: number;
  valor_declarado?: number;
}

export function useClientifySync() {
  return useMutation({
    mutationFn: async (mudanza: ClientifySyncData) => {
      const { data, error } = await supabase.functions.invoke('sync-clientify', {
        body: {
          action: 'create_mudanza',
          mudanza,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Sincronizado con Clientify", {
          description: "Contacto y oportunidad creados en el CRM",
        });
      } else {
        toast.warning("CRM no configurado", {
          description: data.message || "Configure CLIENTIFY_API_KEY para habilitar sincronización",
        });
      }
    },
    onError: (error) => {
      console.error("Error syncing to Clientify:", error);
      toast.error("Error al sincronizar con CRM");
    },
  });
}
