import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import SignatureCanvas from "signature_pad";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PackingListGeneratorProps {
  mudanzaId: string;
  mudanzaNumero: string;
  clienteNombre: string;
}

export function PackingListGenerator({ 
  mudanzaId, 
  mudanzaNumero, 
  clienteNombre 
}: PackingListGeneratorProps) {
  const [signaturePad, setSignaturePad] = useState<SignatureCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: items } = useQuery({
    queryKey: ["inventario", mudanzaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .eq("mudanza_id", mudanzaId)
        .order("habitacion", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useState(() => {
    if (canvasRef.current && !signaturePad) {
      const pad = new SignatureCanvas(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
      });
      setSignaturePad(pad);
    }
  });

  const clearSignature = () => {
    signaturePad?.clear();
  };

  const generatePDF = async () => {
    if (!items || items.length === 0) {
      toast.error("No hay items en el inventario");
      return;
    }

    if (!signaturePad || signaturePad.isEmpty()) {
      toast.error("Por favor, firma el documento");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("PACKING LIST", pageWidth / 2, y, { align: "center" });
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("ABC Moving & Relocation", pageWidth / 2, y, { align: "center" });

      y += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Mudanza: ${mudanzaNumero}`, 20, y);
      
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${clienteNombre}`, 20, y);
      
      y += 7;
      doc.text(`Fecha: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 20, y);

      y += 15;

      // Table Header
      doc.setFillColor(59, 130, 246);
      doc.rect(20, y, pageWidth - 40, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      
      doc.text("Item", 25, y + 5);
      doc.text("Habitación", 80, y + 5);
      doc.text("Cant.", 130, y + 5);
      doc.text("Estado", 150, y + 5);

      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      // Items
      let itemNumber = 1;
      for (const item of items) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        doc.text(`${itemNumber}. ${item.descripcion}`, 25, y);
        doc.text(item.habitacion, 80, y);
        doc.text(item.cantidad.toString(), 135, y, { align: "center" });
        doc.text(item.condicion, 150, y);

        y += 7;
        itemNumber++;
      }

      // Totals
      y += 10;
      doc.setFont("helvetica", "bold");
      const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
      const totalVolumen = items.reduce((acc, item) => acc + (item.volumen || 0), 0);
      const totalPeso = items.reduce((acc, item) => acc + (item.peso || 0), 0);

      doc.text(`Total Items: ${totalItems}`, 20, y);
      y += 7;
      doc.text(`Volumen Total: ${totalVolumen.toFixed(2)} m³`, 20, y);
      y += 7;
      doc.text(`Peso Total: ${totalPeso.toFixed(2)} kg`, 20, y);

      // Signature
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.text("Firma del Cliente:", 20, y);
      
      const signatureData = signaturePad.toDataURL();
      doc.addImage(signatureData, "PNG", 20, y + 5, 60, 20);

      y += 30;
      doc.line(20, y, 80, y);
      doc.setFontSize(8);
      doc.text(clienteNombre, 50, y + 4, { align: "center" });

      // Save PDF
      doc.save(`Packing-List-${mudanzaNumero}.pdf`);
      toast.success("Packing List generado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Resumen del Inventario</h3>
              {items && items.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">
                      {items.reduce((acc, item) => acc + item.cantidad, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Volumen Total</p>
                    <p className="text-2xl font-bold">
                      {items.reduce((acc, item) => acc + (item.volumen || 0), 0).toFixed(2)} m³
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peso Total</p>
                    <p className="text-2xl font-bold">
                      {items.reduce((acc, item) => acc + (item.peso || 0), 0).toFixed(2)} kg
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No hay items registrados</p>
              )}
            </div>

            <div>
              <Label className="mb-2 block">Firma del Cliente</Label>
              <div className="border-2 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 touch-none"
                  width={600}
                  height={160}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                className="mt-2"
              >
                Limpiar Firma
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <p className="text-sm">
                El Packing List incluirá todos los items, fotos y códigos QR
              </p>
            </div>

            <Button
              onClick={generatePDF}
              className="w-full"
              size="lg"
              disabled={!items || items.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Generar y Descargar Packing List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
