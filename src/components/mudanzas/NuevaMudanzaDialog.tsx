import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Debe seleccionar un cliente"),
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
});

type FormValues = z.infer<typeof formSchema>;

export function NuevaMudanzaDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre");
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
    },
  });

  const createMudanza = useMutation({
    mutationFn: async (values: FormValues) => {
      // Generar número de mudanza usando la función de la BD
      const { data: numero, error: numeroError } = await supabase.rpc("generate_mudanza_numero");
      if (numeroError) throw numeroError;

      // Crear mudanza
      const { data: mudanza, error: mudanzaError } = await supabase
        .from("mudanzas")
        .insert([{
          numero,
          cliente_id: values.cliente_id,
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
          coordinador_id: user?.id!,
          estado: "inspeccion" as const,
        }])
        .select()
        .single();

      if (mudanzaError) throw mudanzaError;

      // Obtener datos del cliente para Clientify
      const { data: cliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", values.cliente_id)
        .single();

      // Enviar a Clientify
      if (cliente) {
        try {
          await supabase.functions.invoke("sync-clientify", {
            body: {
              action: "create_mudanza",
              mudanza: {
                ...mudanza,
                cliente,
              },
            },
          });
        } catch (error) {
          console.error("Error syncing with Clientify:", error);
          // No lanzar error, solo loguear
        }
      }

      return mudanza;
    },
    onSuccess: () => {
      toast.success("Mudanza creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["mudanzas"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error("Error al crear mudanza: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-accent hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Mudanza
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Mudanza</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMudanza.mutate(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} - {cliente.tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mudanza *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internacional">Internacional</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="diplomatica">Diplomática</SelectItem>
                        <SelectItem value="corporativa">Corporativa</SelectItem>
                        <SelectItem value="privada">Privada</SelectItem>
                        <SelectItem value="uav">UAV</SelectItem>
                        <SelectItem value="excess_baggage">Excess Baggage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de Transporte *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="maritimo">Marítimo</SelectItem>
                        <SelectItem value="aereo">Aéreo</SelectItem>
                        <SelectItem value="terrestre">Terrestre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Origen</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origen_pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Colombia" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="origen_ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bogotá" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="origen_direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dirección completa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Destino</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destino_pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Estados Unidos" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destino_ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Miami" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="destino_direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dirección completa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_estimada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Estimada de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="volumen_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volumen (m³)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="peso_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} placeholder="0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_declarado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Declarado (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fecha_inspeccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inspección</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMudanza.isPending}>
                {createMudanza.isPending ? "Creando..." : "Crear Mudanza"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
