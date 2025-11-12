import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendDocumentData {
  to: string;
  mudanzaNumero: string;
  documentoTipo: string;
  pdfBase64: string;
  clienteNombre?: string;
  agenteNombre?: string;
}

export function useSendDocument() {
  return useMutation({
    mutationFn: async (data: SendDocumentData) => {
      const { data: result, error } = await supabase.functions.invoke('send-document', {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Documento enviado", {
          description: "El documento ha sido enviado por email exitosamente",
        });
      } else {
        toast.warning("Email no configurado", {
          description: data.message || "Configure RESEND_API_KEY para habilitar envío de emails",
        });
      }
    },
    onError: (error) => {
      console.error("Error sending document:", error);
      toast.error("Error al enviar documento");
    },
  });
}
