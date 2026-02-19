import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield, ChevronDown, ChevronRight, AlertTriangle,
  Clock, CheckCircle2, FileText, Ship, Plane, Container
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const estadoAduanasLabels: Record<string, { label: string; color: string }> = {
  documentos_pendientes: { label: "Docs Pendientes", color: "bg-destructive/10 text-destructive" },
  en_tramite_dian: { label: "En Trámite DIAN", color: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
  inspeccion_programada: { label: "Inspección Programada", color: "bg-primary/10 text-primary" },
  levante_aprobado: { label: "Levante Aprobado", color: "bg-accent/10 text-accent" },
};

const checklistPorTipo: Record<string, string[]> = {
  menaje: ["Inventario Valorado", "Pasaporte vigente", "Visa / permiso de residencia", "Permiso DIAN", "Poder / carta de autorización"],
  diplomatico: ["Carta diplomática", "Exención tributaria", "Pasaporte diplomático", "Nota verbal", "Inventario valorado"],
  vehiculo: ["Título de propiedad", "Homologación RUNT", "Pasaporte propietario", "Declaración de importación", "Certificado de emisiones"],
  corporativa: ["Certificado empresa", "NIT / RUT", "Factura comercial", "Lista de empaque", "Permiso DIAN"],
  privada: ["Inventario Valorado", "Pasaporte vigente", "Visa / permiso de residencia", "Permiso DIAN", "Declaración de valor"],
};

export default function Aduanas() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: aduanasList, isLoading } = useQuery({
    queryKey: ["aduanas-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aduanas")
        .select(`
          *,
          mudanza:mudanzas(numero, tipo, modo, tipo_operacion, cliente:clientes(nombre)),
          checklist:aduanas_checklist(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: contenedores } = useQuery({
    queryKey: ["contenedores-aduanas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contenedores").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getDiasLevante = (fechaLimite: string | null) => {
    if (!fechaLimite) return null;
    return differenceInDays(parseISO(fechaLimite), new Date());
  };

  const getDiasEnPuerto = (fechaArribo: string | null) => {
    if (!fechaArribo) return null;
    return differenceInDays(new Date(), parseISO(fechaArribo));
  };

  const getContenedor = (mudanzaId: string) =>
    (contenedores || []).find((c: any) => c.mudanza_id === mudanzaId);

  return (
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Gestión Aduanera
            </h1>
            <p className="text-muted-foreground">Control de importaciones y trámites DIAN</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {(aduanasList || []).length} trámites activos
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Docs Pendientes", value: (aduanasList || []).filter((a: any) => a.estado === "documentos_pendientes").length, icon: FileText, color: "text-destructive" },
            { label: "En Trámite", value: (aduanasList || []).filter((a: any) => a.estado === "en_tramite_dian").length, icon: Clock, color: "text-[hsl(var(--warning))]" },
            { label: "Inspección", value: (aduanasList || []).filter((a: any) => a.estado === "inspeccion_programada").length, icon: Shield, color: "text-primary" },
            { label: "Levante OK", value: (aduanasList || []).filter((a: any) => a.estado === "levante_aprobado").length, icon: CheckCircle2, color: "text-accent" },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Aduanas List */}
        {isLoading ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Cargando...</CardContent></Card>
        ) : (aduanasList || []).length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No hay trámites aduaneros registrados.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {(aduanasList || []).map((aduana: any) => {
              const isExpanded = expandedId === aduana.id;
              const diasLevante = getDiasLevante(aduana.fecha_limite_levante);
              const diasPuerto = getDiasEnPuerto(aduana.fecha_arribo);
              const cont = getContenedor(aduana.mudanza_id);
              const diasDevolucion = cont ? getDiasLevante(cont.fecha_limite_devolucion) : null;
              const estadoStyle = estadoAduanasLabels[aduana.estado] || estadoAduanasLabels.documentos_pendientes;
              const tipoMudanza = aduana.mudanza?.tipo || "privada";
              const checklistItems = checklistPorTipo[tipoMudanza] || checklistPorTipo.privada;
              const checklistData = aduana.checklist || [];

              return (
                <Card key={aduana.id} className="overflow-hidden">
                  {/* Row header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : aduana.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                    
                    {aduana.mudanza?.modo === "maritimo" ? <Ship className="w-4 h-4 text-primary shrink-0" /> : <Plane className="w-4 h-4 text-primary shrink-0" />}
                    
                    <span className="font-mono font-semibold text-sm">{aduana.mudanza?.numero}</span>
                    <span className="text-sm text-muted-foreground truncate hidden md:inline">{aduana.mudanza?.cliente?.nombre}</span>
                    <span className="text-xs capitalize text-muted-foreground hidden md:inline">{tipoMudanza}</span>
                    
                    <span className="text-xs font-mono text-muted-foreground ml-auto mr-2">
                      {aduana.bl_number || aduana.awb_number || "—"}
                    </span>
                    
                    <Badge className={`text-[10px] ${estadoStyle.color}`}>{estadoStyle.label}</Badge>

                    {diasPuerto !== null && (
                      <span className="text-xs text-muted-foreground">{diasPuerto}d puerto</span>
                    )}

                    {diasLevante !== null && diasLevante <= 3 && (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <CardContent className="border-t space-y-5 pt-4">
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Countdown: Días para levante */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Días para Levante
                          </h4>
                          {diasLevante !== null ? (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${diasLevante <= 3 ? "text-destructive" : diasLevante <= 7 ? "text-[hsl(var(--warning))]" : "text-foreground"}`}>
                                  {diasLevante}
                                </span>
                                <span className="text-sm text-muted-foreground">días restantes</span>
                              </div>
                              <Progress
                                value={Math.max(0, Math.min(100, (diasLevante / 15) * 100))}
                                className={`h-2 ${diasLevante <= 3 ? "[&>div]:bg-destructive" : ""}`}
                              />
                              {diasLevante <= 3 && (
                                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> ¡Urgente! Levante próximo a vencer
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin fecha límite definida</p>
                          )}
                        </div>

                        {/* Countdown: Devolución contenedor */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Container className="w-4 h-4" /> Devolución Contenedor
                          </h4>
                          {cont ? (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${(diasDevolucion ?? 99) <= 3 ? "text-destructive" : "text-foreground"}`}>
                                  {diasDevolucion ?? "—"}
                                </span>
                                <span className="text-sm text-muted-foreground">días para devolver</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Contenedor: <span className="font-mono">{cont.numero_contenedor}</span> · {cont.naviera}
                              </p>
                              {(diasDevolucion ?? 99) <= 5 && (
                                <p className="text-xs text-[hsl(var(--warning))] font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Alerta demurrage/detention
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin contenedor asignado</p>
                          )}
                        </div>
                      </div>

                      {/* Estado Pipeline */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Flujo Aduanero</h4>
                        <div className="flex items-center gap-1">
                          {Object.entries(estadoAduanasLabels).map(([key, val], idx) => {
                            const keys = Object.keys(estadoAduanasLabels);
                            const currentIdx = keys.indexOf(aduana.estado);
                            const isPast = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={key} className="flex-1">
                                <div className={`h-2 rounded-full ${isPast ? "bg-accent" : isCurrent ? "bg-primary" : "bg-muted"}`} />
                                <p className={`text-[10px] mt-1 text-center ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                  {val.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Document Checklist */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Checklist Documental ({tipoMudanza})
                        </h4>
                        <div className="space-y-2">
                          {checklistItems.map((item) => {
                            const found = checklistData.find((c: any) => c.item === item);
                            return (
                              <div key={item} className="flex items-center gap-3 text-sm">
                                <Checkbox checked={found?.completado || false} disabled />
                                <span className={found?.completado ? "line-through text-muted-foreground" : ""}>{item}</span>
                                {found?.completado && <CheckCircle2 className="w-3.5 h-3.5 text-accent ml-auto" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}