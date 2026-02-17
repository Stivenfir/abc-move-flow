import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, ArrowRight, ArrowLeft, Upload, Download, Ship, Plane, Truck, CheckCircle2 } from "lucide-react";
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
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 1, label: "Tipo de Operación" },
  { id: 2, label: "Servicio y Cliente" },
  { id: 3, label: "Origen y Destino" },
  { id: 4, label: "Detalles Logísticos" },
  { id: 5, label: "Confirmación" },
];

const tiposServicio = [
  { value: "internacional", label: "Menaje Internacional", desc: "Mudanza completa de hogar" },
  { value: "diplomatica", label: "Diplomático / UAV", desc: "Servicio diplomático con exenciones" },
  { value: "corporativa", label: "Corporativo", desc: "Relocation empresarial" },
  { value: "privada", label: "Privada", desc: "Mudanza privada estándar" },
  { value: "uav", label: "Vehículo / Moto", desc: "Transporte de vehículos" },
  { value: "excess_baggage", label: "Excess Baggage", desc: "Equipaje adicional" },
  { value: "local", label: "Guarda Muebles", desc: "Almacenamiento temporal" },
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
          notas: values.notas,
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1: return !!tipoOp;
      case 2: return !!form.getValues("cliente_id") && !!form.getValues("tipo");
      case 3: return !!form.getValues("origen_pais") && !!form.getValues("origen_ciudad") && !!form.getValues("destino_pais") && !!form.getValues("destino_ciudad");
      case 4: return true;
      default: return true;
    }
  };

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
          <DialogTitle>Crear Nueva Mudanza Internacional</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0",
                step > s.id ? "bg-primary text-primary-foreground" :
                step === s.id ? "bg-accent text-accent-foreground" :
                "bg-muted text-muted-foreground"
              )}>
                {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
              </div>
              <span className={cn("text-xs ml-1 hidden md:block", step === s.id ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMudanza.mutate(data))} className="space-y-6">

            {/* STEP 1: Tipo de Operación */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">¿Esta mudanza es una EXPORTACIÓN o IMPORTACIÓN?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={cn("cursor-pointer transition-all hover:shadow-md",
                      tipoOp === "exportacion" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                    )}
                    onClick={() => form.setValue("tipo_operacion", "exportacion")}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-primary" />
                      <h4 className="text-xl font-bold">EXPORTACIÓN</h4>
                      <p className="text-sm text-muted-foreground">
                        Colombia → Otro país
                      </p>
                      <Badge variant="outline" className="text-primary border-primary">Origen: Colombia</Badge>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn("cursor-pointer transition-all hover:shadow-md",
                      tipoOp === "importacion" ? "ring-2 ring-accent border-accent" : "hover:border-accent/50"
                    )}
                    onClick={() => form.setValue("tipo_operacion", "importacion")}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <Download className="w-12 h-12 mx-auto text-accent" />
                      <h4 className="text-xl font-bold">IMPORTACIÓN</h4>
                      <p className="text-sm text-muted-foreground">
                        Otro país → Colombia
                      </p>
                      <Badge variant="outline" className="text-accent border-accent">Destino: Colombia</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* STEP 2: Servicio y Cliente */}
            {step === 2 && (
              <div className="space-y-6">
                <FormField control={form.control} name="cliente_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clientes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre} — {c.tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <FormLabel className="mb-3 block">Tipo de Servicio *</FormLabel>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tiposServicio.map((ts) => (
                      <Card
                        key={ts.value}
                        className={cn("cursor-pointer transition-all text-sm",
                          tipoServicio === ts.value ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                        )}
                        onClick={() => form.setValue("tipo", ts.value as any)}
                      >
                        <CardContent className="p-3">
                          <p className="font-semibold">{ts.label}</p>
                          <p className="text-xs text-muted-foreground">{ts.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
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

            {/* STEP 3: Origen y Destino */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> Origen
                    {tipoOp === "exportacion" && <Badge variant="secondary">Colombia</Badge>}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="origen_pais" render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl><Input {...field} placeholder={tipoOp === "exportacion" ? "Colombia" : "País de origen"} /></FormControl>
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

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4 text-accent" /> Destino
                    {tipoOp === "importacion" && <Badge variant="secondary">Colombia</Badge>}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="destino_pais" render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl><Input {...field} placeholder={tipoOp === "importacion" ? "Colombia" : "País destino"} /></FormControl>
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
                            <Icon className="w-6 h-6" />
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

            {/* STEP 4: Detalles */}
            {step === 4 && (
              <div className="space-y-4">
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
                      <FormLabel>Fecha de Inspección</FormLabel>
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
                    <FormControl><Textarea {...field} placeholder="Observaciones, accesos especiales, fragilidad..." rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* STEP 5: Confirmación */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Resumen de la Mudanza</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Operación</p>
                      <Badge className={tipoOp === "exportacion" ? "bg-primary" : "bg-accent"}>
                        {tipoOp === "exportacion" ? "EXPORTACIÓN" : "IMPORTACIÓN"}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Servicio</p>
                      <p className="font-medium capitalize">{form.getValues("tipo")?.replace("_", " ")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Origen</p>
                      <p className="font-medium">{form.getValues("origen_ciudad")}, {form.getValues("origen_pais")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Destino</p>
                      <p className="font-medium">{form.getValues("destino_ciudad")}, {form.getValues("destino_pais")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Transporte</p>
                      <p className="font-medium capitalize">{form.getValues("modo")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">Volumen / Peso</p>
                      <p className="font-medium">{form.getValues("volumen_estimado") || "—"} m³ / {form.getValues("peso_estimado") || "—"} kg</p>
                    </CardContent>
                  </Card>
                </div>
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
              {step < 5 ? (
                <Button type="button" onClick={nextStep} disabled={!canProceed()}>
                  Siguiente <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMudanza.isPending}>
                  {createMudanza.isPending ? "Creando..." : "Crear Mudanza"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
