import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar, 
  FileCheck, ChevronDown, ChevronUp, Edit, Save, X
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

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
  const { id: mudanzaId } = useParams();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(isActual);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fecha_plan: hito.fecha_plan || "",
    responsable: hito.responsable || "",
    comentarios: hito.comentarios || "",
    sla_dias: hito.sla_dias || 7,
  });

  const completarHitoMutation = useMutation({
    mutationFn: async () => {
      const hitoId = hito.id?.startsWith('temp-') ? null : hito.id;
      
      if (!hitoId) {
        // Crear nuevo hito
        const { error } = await supabase
          .from("hitos")
          .insert([{
            mudanza_id: mudanzaId,
            estado: hito.estado as any,
            fecha_plan: editData.fecha_plan || null,
            fecha_real: new Date().toISOString(),
            completado: true,
            sla_dias: editData.sla_dias,
            responsable: editData.responsable || null,
            comentarios: editData.comentarios || null,
          }]);
        
        if (error) throw error;
      } else {
        // Actualizar hito existente
        const { error } = await supabase
          .from("hitos")
          .update({
            fecha_real: new Date().toISOString(),
            completado: true,
          })
          .eq("id", hitoId);
        
        if (error) throw error;
      }
      
      // Registrar evento
      await supabase.from("mudanza_eventos").insert({
        mudanza_id: mudanzaId,
        tipo: "hito_completado",
        categoria: "usuario",
        descripcion: `Hito "${estadoLabel}" marcado como completado`,
        datos_nuevos: { estado: hito.estado, completado: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mudanza", mudanzaId] });
      toast.success("Hito completado exitosamente");
    },
    onError: () => {
      toast.error("Error al completar el hito");
    },
  });

  const guardarHitoMutation = useMutation({
    mutationFn: async () => {
      const hitoId = hito.id?.startsWith('temp-') ? null : hito.id;
      
      if (!hitoId) {
        // Crear nuevo hito
        const { error } = await supabase
          .from("hitos")
          .insert([{
            mudanza_id: mudanzaId,
            estado: hito.estado as any,
            fecha_plan: editData.fecha_plan || null,
            sla_dias: editData.sla_dias,
            responsable: editData.responsable || null,
            comentarios: editData.comentarios || null,
            completado: false,
          }]);
        
        if (error) throw error;
      } else {
        // Actualizar hito existente
        const { error } = await supabase
          .from("hitos")
          .update({
            fecha_plan: editData.fecha_plan || null,
            sla_dias: editData.sla_dias,
            responsable: editData.responsable || null,
            comentarios: editData.comentarios || null,
          })
          .eq("id", hitoId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mudanza", mudanzaId] });
      setIsEditing(false);
      toast.success("Hito actualizado exitosamente");
    },
    onError: () => {
      toast.error("Error al actualizar el hito");
    },
  });

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
            <div className="px-4 pb-4 border-t pt-4 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="fecha_plan">Fecha Planificada</Label>
                      <Input
                        id="fecha_plan"
                        type="date"
                        value={editData.fecha_plan}
                        onChange={(e) => setEditData({ ...editData, fecha_plan: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sla_dias">SLA (días)</Label>
                      <Input
                        id="sla_dias"
                        type="number"
                        value={editData.sla_dias}
                        onChange={(e) => setEditData({ ...editData, sla_dias: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        value={editData.responsable}
                        onChange={(e) => setEditData({ ...editData, responsable: e.target.value })}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comentarios">Comentarios</Label>
                      <Textarea
                        id="comentarios"
                        value={editData.comentarios}
                        onChange={(e) => setEditData({ ...editData, comentarios: e.target.value })}
                        placeholder="Notas o comentarios sobre este hito"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => guardarHitoMutation.mutate()}
                      disabled={guardarHitoMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          fecha_plan: hito.fecha_plan || "",
                          responsable: hito.responsable || "",
                          comentarios: hito.comentarios || "",
                          sla_dias: hito.sla_dias || 7,
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    
                    {!hito.completado && (
                      <Button 
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          completarHitoMutation.mutate();
                        }}
                        disabled={completarHitoMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {completarHitoMutation.isPending ? "Completando..." : "Completar"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
