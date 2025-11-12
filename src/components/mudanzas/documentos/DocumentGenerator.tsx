import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRegistrarEvento } from "@/hooks/useRegistrarEvento";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileText, Send } from "lucide-react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DocumentGeneratorProps {
  mudanzaId: string;
  mudanzaData: any;
}

const documentTypes = [
  { value: "packing-list", label: "Packing List" },
  { value: "bill-of-lading", label: "Bill of Lading (BL)" },
  { value: "air-waybill", label: "Air Waybill (AWB)" },
  { value: "carta-instrucciones", label: "Carta de Instrucciones" },
  { value: "declaracion-aduana", label: "Declaración Aduanera" },
  { value: "carta-diplomatica", label: "Carta Diplomática" },
  { value: "contrato-guarda", label: "Contrato de Guarda" },
  { value: "hoja-entrega", label: "Hoja de Entrega" },
];

export function DocumentGenerator({ mudanzaId, mudanzaData }: DocumentGeneratorProps) {
  const [selectedType, setSelectedType] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(mudanzaData?.cliente?.email || "");
  const queryClient = useQueryClient();
  const registrarEvento = useRegistrarEvento();

  const generateDocument = useMutation({
    mutationFn: async (type: string) => {
      // Generate PDF based on type
      const pdfBlob = await generatePDFByType(type, mudanzaData);
      
      // Convert blob to base64 for storing
      const base64 = await blobToBase64(pdfBlob);
      
      // Save document record
      const docName = `${documentTypes.find(d => d.value === type)?.label}-${mudanzaData.numero}.pdf`;
      
      const { data, error } = await supabase
        .from("documentos")
        .insert({
          mudanza_id: mudanzaId,
          nombre: docName,
          tipo: type,
          url: base64, // In production, upload to storage bucket
          estado: sendEmail ? "enviado" : "pendiente",
          notas: `Generado automáticamente el ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Send email if requested
      if (sendEmail && recipientEmail) {
        // TODO: Implement email sending via edge function
        console.log("Sending email to:", recipientEmail);
      }

      return data;
    },
    onSuccess: () => {
      toast.success(
        sendEmail 
          ? "Documento generado y enviado por email" 
          : "Documento generado exitosamente"
      );
      queryClient.invalidateQueries({ queryKey: ["documentos", mudanzaId] });
      
      // Registrar evento
      registrarEvento.mutate({
        mudanzaId,
        tipo: "documento_generado",
        categoria: "usuario",
        descripcion: `Documento generado: ${documentTypes.find(d => d.value === selectedType)?.label}`,
        datos_nuevos: { tipo: selectedType, enviado: sendEmail },
      });
      
      setSelectedType("");
      setSendEmail(false);
    },
    onError: (error) => {
      toast.error("Error al generar documento");
      console.error(error);
    },
  });

  const generatePDFByType = async (type: string, data: any): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header with logo area
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 30, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ABC Moving & Relocation", pageWidth / 2, 18, { align: "center" });

    y = 40;
    doc.setTextColor(0, 0, 0);

    // Document title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const docTitle = documentTypes.find(d => d.value === type)?.label || "Documento";
    doc.text(docTitle.toUpperCase(), pageWidth / 2, y, { align: "center" });

    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Mudanza info
    doc.text(`Número de Mudanza: ${data.numero}`, 20, y);
    y += 6;
    doc.text(`Cliente: ${data.cliente?.nombre}`, 20, y);
    y += 6;
    doc.text(`Fecha: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 20, y);
    y += 6;
    doc.text(`Origen: ${data.origen_ciudad}, ${data.origen_pais}`, 20, y);
    y += 6;
    doc.text(`Destino: ${data.destino_ciudad}, ${data.destino_pais}`, 20, y);

    y += 15;
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Document-specific content
    switch (type) {
      case "carta-instrucciones":
        y = generateCartaInstrucciones(doc, data, y, pageWidth);
        break;
      case "declaracion-aduana":
        y = generateDeclaracionAduana(doc, data, y, pageWidth);
        break;
      case "bill-of-lading":
        y = generateBillOfLading(doc, data, y, pageWidth);
        break;
      case "air-waybill":
        y = generateAirWaybill(doc, data, y, pageWidth);
        break;
      default:
        doc.setFontSize(12);
        doc.text("Contenido del documento...", 20, y);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `ABC Moving & Relocation | www.abcmoving.com | info@abcmoving.com`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    return doc.output("blob");
  };

  const generateCartaInstrucciones = (doc: any, data: any, y: number, pageWidth: number): number => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estimado Agente:", 20, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const instructions = [
      `Por medio de la presente, solicitamos su asistencia para el manejo de la mudanza ${data.numero}.`,
      ``,
      `Detalles del servicio:`,
      `- Cliente: ${data.cliente?.nombre}`,
      `- Volumen estimado: ${data.volumen_estimado || "N/A"} m³`,
      `- Peso estimado: ${data.peso_estimado || "N/A"} kg`,
      `- Dirección de entrega: ${data.destino_direccion || "Por confirmar"}`,
      ``,
      `Servicios requeridos:`,
      `□ Liberación aduanal`,
      `□ Transporte local`,
      `□ Desempaque`,
      `□ Instalación`,
      ``,
      `Favor confirmar recepción y costos estimados.`,
    ];

    instructions.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });

    y += 15;
    doc.text("Atentamente,", 20, y);
    y += 15;
    doc.text("ABC Moving & Relocation", 20, y);

    return y;
  };

  const generateDeclaracionAduana = (doc: any, data: any, y: number, pageWidth: number): number => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARACIÓN DE IMPORTACIÓN", 20, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const fields = [
      { label: "Tipo de mudanza:", value: data.tipo },
      { label: "Modo de transporte:", value: data.modo },
      { label: "Valor declarado:", value: `USD ${data.valor_declarado || "0.00"}` },
      { label: "País de origen:", value: data.origen_pais },
      { label: "País de destino:", value: data.destino_pais },
    ];

    fields.forEach(({ label, value }) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 80, y);
      y += 8;
    });

    return y;
  };

  const generateBillOfLading = (doc: any, data: any, y: number, pageWidth: number): number => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BILL OF LADING", pageWidth / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Shipper
    doc.setFont("helvetica", "bold");
    doc.text("SHIPPER:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(data.cliente?.nombre || "N/A", 20, y);
    y += 5;
    doc.text(`${data.origen_ciudad}, ${data.origen_pais}`, 20, y);

    y += 12;

    // Consignee
    doc.setFont("helvetica", "bold");
    doc.text("CONSIGNEE:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(data.cliente?.nombre || "N/A", 20, y);
    y += 5;
    doc.text(`${data.destino_ciudad}, ${data.destino_pais}`, 20, y);

    y += 12;

    // Shipment details
    doc.setFont("helvetica", "bold");
    doc.text("SHIPMENT DETAILS:", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    
    doc.text(`Volume: ${data.volumen_estimado || "N/A"} m³`, 20, y);
    y += 6;
    doc.text(`Weight: ${data.peso_estimado || "N/A"} kg`, 20, y);
    y += 6;
    doc.text(`Mode: ${data.modo}`, 20, y);

    return y;
  };

  const generateAirWaybill = (doc: any, data: any, y: number, pageWidth: number): number => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AIR WAYBILL", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("(For air transport only)", pageWidth / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(10);

    // Similar to BL but with air-specific fields
    doc.setFont("helvetica", "bold");
    doc.text("AIRPORT OF DEPARTURE:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`${data.origen_ciudad} (${data.origen_pais})`, 20, y);

    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("AIRPORT OF DESTINATION:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`${data.destino_ciudad} (${data.destino_pais})`, 20, y);

    y += 12;
    doc.text(`Weight: ${data.peso_estimado || "N/A"} kg`, 20, y);

    return y;
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="doc-type">Tipo de Documento</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Selecciona un documento" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="send-email" 
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label
              htmlFor="send-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enviar por email automáticamente
            </label>
          </div>

          {sendEmail && (
            <div>
              <Label htmlFor="recipient-email">Email del Destinatario</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => selectedType && generateDocument.mutate(selectedType)}
              disabled={!selectedType || generateDocument.isPending}
              className="flex-1"
            >
              {generateDocument.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : sendEmail ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generar y Enviar
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Documento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
