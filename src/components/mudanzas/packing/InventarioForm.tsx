import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRegistrarEvento } from "@/hooks/useRegistrarEvento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, QrCode } from "lucide-react";
import QRCode from "qrcode";

const inventarioSchema = z.object({
  habitacion: z.string().min(1, "Campo requerido"),
  descripcion: z.string().min(1, "Campo requerido"),
  cantidad: z.number().min(1, "Mínimo 1"),
  condicion: z.enum(["excelente", "buena", "regular", "dañado"]),
  volumen: z.number().optional(),
  peso: z.number().optional(),
  valor_declarado: z.number().optional(),
  embalaje: z.string().optional(),
  notas: z.string().optional(),
});

type InventarioFormData = z.infer<typeof inventarioSchema>;

interface InventarioFormProps {
  mudanzaId: string;
}

export function InventarioForm({ mudanzaId }: InventarioFormProps) {
  const [fotos, setFotos] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const registrarEvento = useRegistrarEvento();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      cantidad: 1,
      condicion: "buena",
    }
  });

  const createItem = useMutation({
    mutationFn: async (data: InventarioFormData) => {
      // Generate unique QR code
      const qrData = `${mudanzaId}-${Date.now()}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 300 });

      // TODO: Upload photos to storage bucket
      const fotosUrls: string[] = [];

      const { data: result, error } = await supabase
        .from("inventario")
        .insert({
          mudanza_id: mudanzaId,
          habitacion: data.habitacion,
          descripcion: data.descripcion,
          cantidad: data.cantidad,
          condicion: data.condicion,
          volumen: data.volumen,
          peso: data.peso,
          valor_declarado: data.valor_declarado,
          embalaje: data.embalaje,
          notas: data.notas,
          codigo_qr: qrData,
          fotos: fotosUrls,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("Item agregado al inventario");
      queryClient.invalidateQueries({ queryKey: ["inventario", mudanzaId] });
      
      // Registrar evento
      registrarEvento.mutate({
        mudanzaId,
        tipo: "inventario_agregado",
        categoria: "usuario",
        descripcion: "Item agregado al inventario",
      });
      
      reset();
      setFotos([]);
    },
    onError: (error) => {
      toast.error("Error al agregar item: " + error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos([...fotos, ...Array.from(e.target.files)]);
    }
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InventarioFormData) => {
    createItem.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="habitacion">Habitación/Área</Label>
          <Input
            id="habitacion"
            placeholder="Ej: Sala, Dormitorio Principal"
            {...register("habitacion")}
          />
          {errors.habitacion && (
            <p className="text-sm text-destructive mt-1">{errors.habitacion.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción del Item</Label>
          <Input
            id="descripcion"
            placeholder="Ej: Sofá de 3 puestos"
            {...register("descripcion")}
          />
          {errors.descripcion && (
            <p className="text-sm text-destructive mt-1">{errors.descripcion.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input
            id="cantidad"
            type="number"
            min="1"
            {...register("cantidad", { valueAsNumber: true })}
          />
          {errors.cantidad && (
            <p className="text-sm text-destructive mt-1">{errors.cantidad.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="condicion">Condición</Label>
          <Select
            onValueChange={(value) => setValue("condicion", value as any)}
            defaultValue="buena"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excelente">Excelente</SelectItem>
              <SelectItem value="buena">Buena</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="dañado">Dañado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="volumen">Volumen (m³)</Label>
          <Input
            id="volumen"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("volumen", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register("peso", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="valor_declarado">Valor Declarado (USD)</Label>
          <Input
            id="valor_declarado"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("valor_declarado", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="embalaje">Tipo de Embalaje</Label>
          <Input
            id="embalaje"
            placeholder="Ej: Caja de cartón, Envolvimiento"
            {...register("embalaje")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notas">Notas Adicionales</Label>
        <Textarea
          id="notas"
          placeholder="Instrucciones especiales, daños existentes, etc."
          rows={3}
          {...register("notas")}
        />
      </div>

      {/* Photo Upload */}
      <div>
        <Label>Fotos del Item</Label>
        <div className="mt-2 space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click para subir fotos o arrastra aquí
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG hasta 10MB
              </p>
            </label>
          </div>

          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {fotos.map((foto, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-2">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <QrCode className="w-5 h-5 text-primary" />
        <p className="text-sm text-muted-foreground flex-1">
          Se generará un código QR único para este item
        </p>
        <Button type="submit" disabled={createItem.isPending}>
          {createItem.isPending ? "Guardando..." : "Agregar Item"}
        </Button>
      </div>
    </form>
  );
}
