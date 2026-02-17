import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MessageSquare, Mail, Phone, StickyNote, Plus, Send,
  Clock
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const tipoIcons: Record<string, any> = {
  email: Mail,
  whatsapp: Phone,
  nota: StickyNote,
  mensaje: MessageSquare,
};

const tipoColors: Record<string, string> = {
  email: "bg-primary/10 text-primary",
  whatsapp: "bg-accent/10 text-accent",
  nota: "bg-muted text-muted-foreground",
  mensaje: "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]",
};

const plantillas = [
  { id: "prealert", label: "Pre-alert al agente destino", subject: "Pre-Alert: Envío en tránsito", body: "Estimado agente,\n\nLe informamos que el envío se encuentra en tránsito hacia su destino. Adjuntamos documentación relevante.\n\nQuedamos atentos." },
  { id: "empaque", label: "Confirmación de empaque", subject: "Confirmación de empaque completado", body: "Estimado cliente,\n\nLe confirmamos que el proceso de empaque de sus pertenencias ha sido completado exitosamente.\n\nQuedamos a su disposición." },
  { id: "doc_faltante", label: "Recordatorio documento faltante", subject: "Recordatorio: Documento pendiente", body: "Estimado/a,\n\nLe recordamos que tenemos pendiente la recepción del siguiente documento para continuar con el trámite:\n\n[DOCUMENTO]\n\nAgradecemos su pronta respuesta." },
  { id: "eta", label: "ETA actualizada", subject: "Actualización de fecha estimada de arribo", body: "Estimado cliente,\n\nLe informamos que la fecha estimada de arribo ha sido actualizada:\n\nNueva ETA: [FECHA]\n\nQuedamos atentos a cualquier consulta." },
];

interface Props {
  mudanzaId: string;
}

export function ComunicacionesModule({ mudanzaId }: Props) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipo, setTipo] = useState("email");
  const [destinatario, setDestinatario] = useState("cliente");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const { data: comunicaciones, isLoading } = useQuery({
    queryKey: ["comunicaciones", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicaciones")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("comunicaciones").insert({
        mudanza_id: mudanzaId,
        remitente_id: "00000000-0000-0000-0000-000000000000",
        tipo,
        mensaje: asunto ? `[${asunto}] ${mensaje}` : mensaje,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicaciones", mudanzaId] });
      toast.success("Mensaje enviado correctamente");
      setDialogOpen(false);
      setAsunto("");
      setMensaje("");
    },
    onError: () => toast.error("Error al enviar mensaje"),
  });

  const applyTemplate = (tpl: typeof plantillas[0]) => {
    setAsunto(tpl.subject);
    setMensaje(tpl.body);
  };

  const parseMsg = (raw: string) => {
    const match = raw.match(/^\[(.+?)\]\s*([\s\S]*)$/);
    if (match) return { subject: match[1], body: match[2] };
    return { subject: null, body: raw };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Comunicaciones
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Mensaje</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Quick Templates */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Plantillas rápidas</Label>
                <div className="flex flex-wrap gap-1.5">
                  {plantillas.map((tpl) => (
                    <Button key={tpl.id} variant="outline" size="sm" className="text-xs h-7" onClick={() => applyTemplate(tpl)}>
                      {tpl.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">📧 Email</SelectItem>
                      <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                      <SelectItem value="nota">📝 Nota interna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Destinatario</Label>
                  <Select value={destinatario} onValueChange={setDestinatario}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="agente">Agente</SelectItem>
                      <SelectItem value="interno">Interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Asunto</Label>
                <Input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Asunto del mensaje" />
              </div>

              <div className="space-y-1.5">
                <Label>Mensaje</Label>
                <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={5} placeholder="Escribe tu mensaje..." />
              </div>

              <Button className="w-full" onClick={() => sendMutation.mutate()} disabled={!mensaje.trim()}>
                <Send className="w-4 h-4 mr-2" /> Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
        ) : (comunicaciones || []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No hay comunicaciones registradas.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {(comunicaciones || []).map((com: any) => {
                const Icon = tipoIcons[com.tipo] || MessageSquare;
                const colorClass = tipoColors[com.tipo] || tipoColors.mensaje;
                const { subject, body } = parseMsg(com.mensaje);

                return (
                  <div key={com.id} className="flex gap-3 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] capitalize">{com.tipo}</Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(com.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                        </span>
                      </div>
                      {subject && <p className="text-sm font-semibold mb-0.5">{subject}</p>}
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">{body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}