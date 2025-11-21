import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar, 
  FileCheck, ChevronDown, ChevronUp, Edit, Save, X,
  FileText, Upload, Eye, Check, Circle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";

interface TimelineHitoProps {
  hito: {
    id: string;
    estado: string;
    mudanza_id?: string;
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

// Documentos requeridos por estado
const documentosRequeridos: Record<string, { nombre: string; obligatorio: boolean }[]> = {
  inspeccion: [
    { nombre: "Reporte de inspección", obligatorio: true },
    { nombre: "Fotos de la carga", obligatorio: true },
  ],
  cotizacion: [
    { nombre: "Cotización PDF", obligatorio: true },
    { nombre: "Términos y condiciones", obligatorio: false },
  ],
  cotizacion_enviada: [
    { nombre: "Cotización PDF", obligatorio: true },
  ],
  cotizacion_aceptada: [
    { nombre: "Cotización firmada", obligatorio: true },
  ],
  booking: [
    { nombre: "Booking confirmation", obligatorio: true },
    { nombre: "Shipping instructions", obligatorio: false },
  ],
  booking_solicitado: [
    { nombre: "Solicitud de booking", obligatorio: true },
  ],
  booking_confirmado: [
    { nombre: "Booking confirmation", obligatorio: true },
  ],
  programacion_empaque: [
    { nombre: "Cronograma de empaque", obligatorio: true },
  ],
  empaque: [
    { nombre: "Packing list final", obligatorio: true },
    { nombre: "Fotos del empaque", obligatorio: true },
  ],
  bodega: [
    { nombre: "Recibo de bodega", obligatorio: true },
  ],
  despacho: [
    { nombre: "Bill of Lading (BL)", obligatorio: true },
    { nombre: "DEX", obligatorio: true },
    { nombre: "Certificados ISPM15", obligatorio: false },
  ],
  traslado_puerto: [
    { nombre: "Guía de traslado", obligatorio: true },
  ],
  exportacion_completa: [
    { nombre: "BL Final", obligatorio: true },
  ],
  transito: [
    { nombre: "Tracking marítimo/aéreo", obligatorio: false },
  ],
  en_transito_internacional: [
    { nombre: "Tracking internacional", obligatorio: false },
  ],
  arribado_puerto: [
    { nombre: "Arrival notice", obligatorio: true },
  ],
  aduana: [
    { nombre: "Arrival notice", obligatorio: true },
    { nombre: "Declaración aduanal", obligatorio: true },
    { nombre: "Levante", obligatorio: true },
  ],
  en_proceso_aduanas: [
    { nombre: "Declaración aduanal", obligatorio: true },
  ],
  levante_aprobado: [
    { nombre: "Levante aprobado", obligatorio: true },
  ],
  programando_entrega: [
    { nombre: "Orden de entrega", obligatorio: true },
  ],
  entrega: [
    { nombre: "Orden de entrega", obligatorio: true },
    { nombre: "Acta de conformidad", obligatorio: true },
  ],
  contenedor_devuelto: [
    { nombre: "Comprobante de devolución", obligatorio: true },
  ],
};

export function TimelineHito({ 
  hito, 
  estadoLabel, 
  isActual, 
  isCompletado, 
  isPendiente 
}: TimelineHitoProps) {
  const { id: mudanzaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(isActual);
  const [isEditing, setIsEditing] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [editData, setEditData] = useState({
    fecha_plan: hito.fecha_plan || "",
    responsable: hito.responsable || "",
    comentarios: hito.comentarios || "",
    sla_dias: hito.sla_dias || 7,
  });

  // Obtener documentos de esta mudanza
  const { data: documentos = [] } = useQuery({
    queryKey: ["documentos", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos")
        .select("*")
        .eq("mudanza_id", mudanzaId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!mudanzaId,
  });

  // Documentos requeridos para este estado
  const docsRequeridos = documentosRequeridos[hito.estado] || [];
  
  // Verificar si hay documentos cargados que coincidan con los requeridos
  const documentosEstado = docsRequeridos.map(req => {
    const encontrado = documentos.find(doc => 
      doc.nombre.toLowerCase().includes(req.nombre.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(req.nombre.toLowerCase().replace(/ /g, '-'))
    );
    return {
      ...req,
      cargado: !!encontrado,
      documento: encontrado,
    };
  });

  const documentosObligatoriosFaltantes = documentosEstado.filter(
    d => d.obligatorio && !d.cargado
  ).length;

  const completarHitoMutation = useMutation({
    mutationFn: async () => {
      if (documentosObligatoriosFaltantes > 0) {
        throw new Error(`Faltan ${documentosObligatoriosFaltantes} documentos obligatorios`);
      }

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
    onError: (error: Error) => {
      toast.error(error.message || "Error al completar el hito");
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
                  {docsRequeridos.length > 0 && documentosObligatoriosFaltantes > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {documentosObligatoriosFaltantes} docs faltantes
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

                  {/* Sección de Documentos */}
                  {docsRequeridos.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              Documentos Requeridos
                            </span>
                            {documentosObligatoriosFaltantes > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {documentosObligatoriosFaltantes} obligatorios faltantes
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDocuments(!showDocuments);
                            }}
                          >
                            {showDocuments ? "Ocultar" : "Ver"}
                          </Button>
                        </div>

                        {showDocuments && (
                          <div className="space-y-2 pl-6">
                            {documentosEstado.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {doc.cargado ? (
                                    <Check className="w-4 h-4 text-success" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className={doc.cargado ? "text-muted-foreground line-through" : ""}>
                                    {doc.nombre}
                                  </span>
                                  {doc.obligatorio && !doc.cargado && (
                                    <Badge variant="outline" className="text-xs">
                                      Obligatorio
                                    </Badge>
                                  )}
                                </div>
                                {doc.cargado && doc.documento && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(doc.documento.url, "_blank");
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Scroll to documents module
                                const docsModule = document.querySelector('[data-module="documentos"]');
                                if (docsModule) {
                                  docsModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Ir a Módulo de Documentos
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
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
                        disabled={completarHitoMutation.isPending || documentosObligatoriosFaltantes > 0}
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
