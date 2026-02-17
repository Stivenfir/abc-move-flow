import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus, ArrowRight, ArrowLeft, Upload, Download, Ship, Plane, Truck,
  CheckCircle2, Shield, Building2, Car, Briefcase, Globe, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Debe seleccionar un cliente"),
  tipo_operacion: z.enum(["exportacion", "importacion"]),
  tipo: z.enum(["uav", "excess_baggage", "diplomatica", "corporativa", "privada", "local", "internacional"]),
  modo: z.enum(["aereo", "maritimo", "terrestre"]),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]),
  origen_pais: z.string().min(2, "País de origen requerido"),
  origen_ciudad: z.string().min(2, "Ciudad de origen requerida"),
  origen_direccion: z.string().optional(),
  destino_pais: z.string().min(2, "País de destino requerido"),
  destino_ciudad: z.string().min(2, "Ciudad de destino requerida"),
  destino_direccion: z.string().optional(),
  fecha_estimada: z.string().optional(),
  volumen_estimado: z.coerce.number().positive().optional(),
  peso_estimado: z.coerce.number().positive().optional(),
  valor_declarado: z.coerce.number().positive().optional(),
  fecha_inspeccion: z.string().optional(),
  notas: z.string().optional(),
  // Campos especiales diplomático
  carta_diplomatica: z.string().optional(),
  exencion_impuestos: z.string().optional(),
  pasaporte_diplomatico: z.string().optional(),
  autorizacion_embajada: z.string().optional(),
  contacto_embajada: z.string().optional(),
  // Campos especiales corporativo
  empresa_patrocinadora: z.string().optional(),
  contacto_rrhh: z.string().optional(),
  numero_orden_compra: z.string().optional(),
  presupuesto_aprobado: z.coerce.number().optional(),
  // Campos especiales vehículo
  marca_vehiculo: z.string().optional(),
  modelo_vehiculo: z.string().optional(),
  anio_vehiculo: z.string().optional(),
  placa_vehiculo: z.string().optional(),
  vin_vehiculo: z.string().optional(),
  // Campos especiales importación
  bl_number: z.string().optional(),
  awb_number: z.string().optional(),
  agente_origen: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, label: "Operación" },
  { id: 2, label: "Cliente y Servicio" },
  { id: 3, label: "Origen y Destino" },
  { id: 4, label: "Logística" },
  { id: 5, label: "Campos Especiales" },
  { id: 6, label: "Confirmación" },
];

const tiposServicio = [
  { value: "internacional", label: "Menaje Internacional", desc: "Mudanza completa de hogar", icon: Globe },
  { value: "diplomatica", label: "Diplomático / UAV", desc: "Servicio con exenciones diplomáticas", icon: Shield },
  { value: "corporativa", label: "Corporativo", desc: "Relocation empresarial", icon: Building2 },
  { value: "privada", label: "Privada", desc: "Mudanza privada estándar", icon: Briefcase },
  { value: "uav", label: "Vehículo / Moto", desc: "Transporte de vehículos", icon: Car },
  { value: "excess_baggage", label: "Excess Baggage", desc: "Equipaje adicional", icon: Briefcase },
  { value: "local", label: "Guarda Muebles", desc: "Almacenamiento temporal", icon: Building2 },
];

export function NuevaMudanzaDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("nombre");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prioridad: "media",
      tipo: "internacional",
      modo: "maritimo",
      tipo_operacion: undefined as any,
    },
  });

  const tipoOp = form.watch("tipo_operacion");
  const tipoServicio = form.watch("tipo");

  const createMudanza = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data: numero, error: numeroError } = await supabase.rpc("generate_mudanza_numero");
      if (numeroError) throw numeroError;

      // Build notas with special fields
      const specialNotes: string[] = [];
      if (values.notas) specialNotes.push(values.notas);

      if (tipoServicio === "diplomatica" || tipoServicio === "uav") {
        if (values.carta_diplomatica) specialNotes.push(`Carta Diplomática: ${values.carta_diplomatica}`);
        if (values.exencion_impuestos) specialNotes.push(`Exención: ${values.exencion_impuestos}`);
        if (values.pasaporte_diplomatico) specialNotes.push(`Pasaporte: ${values.pasaporte_diplomatico}`);
        if (values.autorizacion_embajada) specialNotes.push(`Autorización: ${values.autorizacion_embajada}`);
        if (values.contacto_embajada) specialNotes.push(`Contacto Embajada: ${values.contacto_embajada}`);
      }
      if (tipoServicio === "corporativa") {
        if (values.empresa_patrocinadora) specialNotes.push(`Empresa: ${values.empresa_patrocinadora}`);
        if (values.contacto_rrhh) specialNotes.push(`RRHH: ${values.contacto_rrhh}`);
        if (values.numero_orden_compra) specialNotes.push(`OC: ${values.numero_orden_compra}`);
        if (values.presupuesto_aprobado) specialNotes.push(`Presupuesto: $${values.presupuesto_aprobado}`);
      }
      if (tipoServicio === "uav") {
        if (values.marca_vehiculo) specialNotes.push(`Vehículo: ${values.marca_vehiculo} ${values.modelo_vehiculo || ""} ${values.anio_vehiculo || ""}`);
        if (values.placa_vehiculo) specialNotes.push(`Placa: ${values.placa_vehiculo}`);
        if (values.vin_vehiculo) specialNotes.push(`VIN: ${values.vin_vehiculo}`);
      }
      if (tipoOp === "importacion") {
        if (values.bl_number) specialNotes.push(`BL: ${values.bl_number}`);
        if (values.awb_number) specialNotes.push(`AWB: ${values.awb_number}`);
        if (values.agente_origen) specialNotes.push(`Agente origen: ${values.agente_origen}`);
      }

      const { data: mudanza, error: mudanzaError } = await supabase
        .from("mudanzas")
        .insert([{
          numero,
          cliente_id: values.cliente_id,
          tipo_operacion: values.tipo_operacion,
          tipo: values.tipo,
          modo: values.modo,
          prioridad: values.prioridad,
          origen_pais: values.origen_pais,
          origen_ciudad: values.origen_ciudad,
          origen_direccion: values.origen_direccion,
          destino_pais: values.destino_pais,
          destino_ciudad: values.destino_ciudad,
          destino_direccion: values.destino_direccion,
          fecha_estimada: values.fecha_estimada,
          volumen_estimado: values.volumen_estimado,
          peso_estimado: values.peso_estimado,
          valor_declarado: values.valor_declarado,
          fecha_inspeccion: values.fecha_inspeccion,
          notas: specialNotes.join("\n"),
          coordinador_id: null,
          estado: "inspeccion" as const,
        }])
        .select()
        .single();

      if (mudanzaError) throw mudanzaError;
      return mudanza;
    },
    onSuccess: () => {
      toast.success("Mudanza creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["mudanzas"] });
      setOpen(false);
      setStep(1);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error("Error al crear mudanza: " + error.message);
    },
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1: return !!tipoOp;
      case 2: return !!form.getValues("cliente_id") && !!form.getValues("tipo");
      case 3: return !!form.getValues("origen_pais") && !!form.getValues("origen_ciudad") && !!form.getValues("destino_pais") && !!form.getValues("destino_ciudad");
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const getClienteName = () => {
    const cid = form.getValues("cliente_id");
    return clientes?.find(c => c.id === cid)?.nombre || "—";
  };

  const getTipoLabel = () => tiposServicio.find(t => t.value === tipoServicio)?.label || tipoServicio;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setStep(1); form.reset(); } }}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mudanza
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Crear Nueva Mudanza
            {tipoOp && (
              <Badge className={tipoOp === "exportacion" ? "bg-primary" : "bg-accent"}>
                {tipoOp === "exportacion" ? "EXPORTACIÓN" : "IMPORTACIÓN"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-0.5 mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors",
                step > s.id ? "bg-primary text-primary-foreground" :
                step === s.id ? "bg-accent text-accent-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={cn("text-[10px] ml-1 hidden lg:block leading-tight", step === s.id ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMudanza.mutate(data))} className="space-y-6">

            {/* ========== STEP 1: Tipo de Operación ========== */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">¿Esta mudanza es una EXPORTACIÓN o IMPORTACIÓN?</h3>
                <p className="text-sm text-muted-foreground text-center">Selecciona el tipo de operación para definir el flujo del servicio</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={cn("cursor-pointer transition-all hover:shadow-md",
                      tipoOp === "exportacion" ? "ring-2 ring-primary border-primary shadow-md" : "hover:border-primary/50"
                    )}
                    onClick={() => {
                      form.setValue("tipo_operacion", "exportacion");
                      form.setValue("origen_pais", "Colombia");
                    }}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Upload className="w-14 h-14 mx-auto text-primary" />
                      <h4 className="text-xl font-bold">EXPORTACIÓN</h4>
                      <p className="text-sm text-muted-foreground">Colombia → Otro país</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>• Foco en empaque y packing list</p>
                        <p>• Coordinación de booking</p>
                        <p>• Pre-alert al agente destino</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">Origen: Colombia</Badge>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn("cursor-pointer transition-all hover:shadow-md",
                      tipoOp === "importacion" ? "ring-2 ring-accent border-accent shadow-md" : "hover:border-accent/50"
                    )}
                    onClick={() => {
                      form.setValue("tipo_operacion", "importacion");
                      form.setValue("destino_pais", "Colombia");
                    }}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Download className="w-14 h-14 mx-auto text-accent" />
                      <h4 className="text-xl font-bold">IMPORTACIÓN</h4>
                      <p className="text-sm text-muted-foreground">Otro país → Colombia</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>• Foco en aduanas y levante</p>
                        <p>• Control de contenedor</p>
                        <p>• Coordinación de entrega</p>
                      </div>
                      <Badge variant="outline" className="text-accent border-accent">Destino: Colombia</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ========== STEP 2: Cliente y Servicio ========== */}
            {step === 2 && (
              <div className="space-y-6">
                <FormField control={form.control} name="cliente_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clientes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              {c.nombre}
                              <Badge variant="outline" className="text-[10px] capitalize">{c.tipo}</Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <FormLabel className="mb-3 block">Tipo de Servicio *</FormLabel>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tiposServicio.map((ts) => {
                      const Icon = ts.icon;
                      return (
                        <Card
                          key={ts.value}
                          className={cn("cursor-pointer transition-all",
                            tipoServicio === ts.value ? "ring-2 ring-primary border-primary shadow-sm" : "hover:border-primary/50"
                          )}
                          onClick={() => form.setValue("tipo", ts.value as any)}
                        >
                          <CardContent className="p-3 flex items-start gap-3">
                            <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", tipoServicio === ts.value ? "text-primary" : "text-muted-foreground")} />
                            <div>
                              <p className="font-semibold text-sm">{ts.label}</p>
                              <p className="text-xs text-muted-foreground">{ts.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <FormField control={form.control} name="prioridad" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="baja">🟢 Baja</SelectItem>
                        <SelectItem value="media">🟡 Media</SelectItem>
                        <SelectItem value="alta">🟠 Alta</SelectItem>
                        <SelectItem value="urgente">🔴 Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* ========== STEP 3: Origen y Destino ========== */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> Origen
                    {tipoOp === "exportacion" && <Badge variant="secondary" className="text-xs">Colombia (auto)</Badge>}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="origen_pais" render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="País de origen" readOnly={tipoOp === "exportacion"} className={tipoOp === "exportacion" ? "bg-muted" : ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="origen_ciudad" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl><Input {...field} placeholder="Ciudad" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="origen_direccion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Recogida</FormLabel>
                      <FormControl><Input {...field} placeholder="Dirección completa" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4 text-accent" /> Destino
                    {tipoOp === "importacion" && <Badge variant="secondary" className="text-xs">Colombia (auto)</Badge>}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="destino_pais" render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="País destino" readOnly={tipoOp === "importacion"} className={tipoOp === "importacion" ? "bg-muted" : ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destino_ciudad" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl><Input {...field} placeholder="Ciudad" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="destino_direccion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Entrega</FormLabel>
                      <FormControl><Input {...field} placeholder="Dirección completa" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Separator />

                <FormField control={form.control} name="modo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de Transporte *</FormLabel>
                    <div className="flex gap-3">
                      {[
                        { v: "maritimo", icon: Ship, label: "Marítimo" },
                        { v: "aereo", icon: Plane, label: "Aéreo" },
                        { v: "terrestre", icon: Truck, label: "Terrestre" },
                      ].map(({ v, icon: Icon, label }) => (
                        <Card
                          key={v}
                          className={cn("flex-1 cursor-pointer transition-all",
                            field.value === v ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                          )}
                          onClick={() => form.setValue("modo", v as any)}
                        >
                          <CardContent className="p-3 flex flex-col items-center gap-1">
                            <Icon className={cn("w-6 h-6", field.value === v ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-medium">{label}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* ========== STEP 4: Detalles Logísticos ========== */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Detalles Logísticos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fecha_estimada" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Estimada de Servicio</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fecha_inspeccion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inspección / Visita Técnica</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="volumen_estimado" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volumen Estimado (m³)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} placeholder="0.0" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="peso_estimado" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso Estimado (kg)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} placeholder="0.0" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valor_declarado" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Declarado (USD)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} placeholder="0.00" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notas" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas / Instrucciones Especiales</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Accesos especiales, fragilidad, restricciones horarias..." rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* ========== STEP 5: Campos Especiales ========== */}
            {step === 5 && (
              <div className="space-y-5">
                <h3 className="font-semibold">Campos Especiales — {getTipoLabel()}</h3>

                {/* Diplomático / UAV */}
                {(tipoServicio === "diplomatica" || (tipoServicio === "uav" && tipoOp === "exportacion")) && (
                  <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">Documentación Diplomática</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="carta_diplomatica" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° Carta Diplomática</FormLabel>
                            <FormControl><Input {...field} placeholder="CD-2026-XXX" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="exencion_impuestos" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exención de Impuestos</FormLabel>
                            <FormControl><Input {...field} placeholder="Número de resolución" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="pasaporte_diplomatico" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° Pasaporte Diplomático</FormLabel>
                            <FormControl><Input {...field} placeholder="Pasaporte" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="autorizacion_embajada" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autorización Embajada</FormLabel>
                            <FormControl><Input {...field} placeholder="Referencia de autorización" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="contacto_embajada" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contacto en la Embajada</FormLabel>
                          <FormControl><Input {...field} placeholder="Nombre y teléfono del contacto" /></FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                )}

                {/* Corporativo */}
                {tipoServicio === "corporativa" && (
                  <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold">Información Corporativa</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="empresa_patrocinadora" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa Patrocinadora</FormLabel>
                            <FormControl><Input {...field} placeholder="Nombre de la empresa" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="contacto_rrhh" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contacto RRHH</FormLabel>
                            <FormControl><Input {...field} placeholder="Nombre y email" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="numero_orden_compra" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° Orden de Compra</FormLabel>
                            <FormControl><Input {...field} placeholder="OC-XXXX" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="presupuesto_aprobado" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Presupuesto Aprobado (USD)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} placeholder="0.00" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vehículo */}
                {tipoServicio === "uav" && (
                  <Card className="border-primary/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Car className="w-5 h-5" />
                        <span className="font-semibold">Datos del Vehículo</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="marca_vehiculo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl><Input {...field} placeholder="Toyota, BMW..." /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="modelo_vehiculo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl><Input {...field} placeholder="Corolla, X5..." /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="anio_vehiculo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Año</FormLabel>
                            <FormControl><Input {...field} placeholder="2024" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="placa_vehiculo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placa</FormLabel>
                            <FormControl><Input {...field} placeholder="ABC-123" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="vin_vehiculo" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° VIN / Chasis</FormLabel>
                            <FormControl><Input {...field} placeholder="VIN number" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Importación - campos adicionales */}
                {tipoOp === "importacion" && (
                  <Card className="border-accent/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2 text-accent">
                        <Download className="w-5 h-5" />
                        <span className="font-semibold">Datos de Importación</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="bl_number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° BL (Bill of Lading)</FormLabel>
                            <FormControl><Input {...field} placeholder="MAEU1234567" /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="awb_number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>N° AWB (Air Waybill)</FormLabel>
                            <FormControl><Input {...field} placeholder="Solo si es aéreo" /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="agente_origen" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agente de Origen</FormLabel>
                          <FormControl><Input {...field} placeholder="Nombre del agente internacional" /></FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                )}

                {/* Menaje Internacional / Privada / Excess Baggage / Local - info general */}
                {["internacional", "privada", "excess_baggage", "local"].includes(tipoServicio) && tipoOp === "exportacion" && (
                  <Card className="border-muted">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">No hay campos especiales adicionales para este tipo de servicio.</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Los detalles específicos se completarán en las etapas operativas (inspección, empaque, booking).
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ========== STEP 6: Confirmación ========== */}
            {step === 6 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Resumen de la Mudanza</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Operación</p>
                      <Badge className={tipoOp === "exportacion" ? "bg-primary" : "bg-accent"}>
                        {tipoOp === "exportacion" ? "EXPORTACIÓN" : "IMPORTACIÓN"}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="font-medium text-sm">{getClienteName()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Servicio</p>
                      <p className="font-medium text-sm">{getTipoLabel()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Prioridad</p>
                      <p className="font-medium text-sm capitalize">{form.getValues("prioridad")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Origen</p>
                      <p className="font-medium text-sm">{form.getValues("origen_ciudad")}, {form.getValues("origen_pais")}</p>
                      {form.getValues("origen_direccion") && <p className="text-xs text-muted-foreground">{form.getValues("origen_direccion")}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Destino</p>
                      <p className="font-medium text-sm">{form.getValues("destino_ciudad")}, {form.getValues("destino_pais")}</p>
                      {form.getValues("destino_direccion") && <p className="text-xs text-muted-foreground">{form.getValues("destino_direccion")}</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Transporte</p>
                      <p className="font-medium text-sm capitalize">{form.getValues("modo")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Volumen / Peso</p>
                      <p className="font-medium text-sm">{form.getValues("volumen_estimado") || "—"} m³ / {form.getValues("peso_estimado") || "—"} kg</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Special fields summary */}
                {(tipoServicio === "diplomatica" && form.getValues("carta_diplomatica")) && (
                  <Card className="border-primary/30">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Datos Diplomáticos</p>
                      <p className="text-sm">Carta: {form.getValues("carta_diplomatica")} | Pasaporte: {form.getValues("pasaporte_diplomatico") || "—"}</p>
                    </CardContent>
                  </Card>
                )}
                {(tipoServicio === "corporativa" && form.getValues("empresa_patrocinadora")) && (
                  <Card className="border-primary/30">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Datos Corporativos</p>
                      <p className="text-sm">Empresa: {form.getValues("empresa_patrocinadora")} | OC: {form.getValues("numero_orden_compra") || "—"}</p>
                    </CardContent>
                  </Card>
                )}
                {(tipoServicio === "uav" && form.getValues("marca_vehiculo")) && (
                  <Card className="border-primary/30">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Vehículo</p>
                      <p className="text-sm">{form.getValues("marca_vehiculo")} {form.getValues("modelo_vehiculo")} {form.getValues("anio_vehiculo")} | Placa: {form.getValues("placa_vehiculo") || "—"}</p>
                    </CardContent>
                  </Card>
                )}
                {(tipoOp === "importacion" && form.getValues("bl_number")) && (
                  <Card className="border-accent/30">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Importación</p>
                      <p className="text-sm">BL: {form.getValues("bl_number")} | Agente: {form.getValues("agente_origen") || "—"}</p>
                    </CardContent>
                  </Card>
                )}

                {form.getValues("notas") && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">Notas</p>
                      <p className="text-sm">{form.getValues("notas")}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              )}
              {step < 6 ? (
                <Button type="button" onClick={nextStep} disabled={!canProceed()}>
                  Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMudanza.isPending} className="bg-accent hover:bg-accent/90">
                  {createMudanza.isPending ? "Creando..." : "✅ Crear Mudanza"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
