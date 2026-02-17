import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Package, MapPin, Truck, Calendar, Scale, Box,
  FileText, CreditCard, MessageCircle, LogOut,
  CheckCircle2, Clock, AlertTriangle, ImageIcon,
  ChevronRight, Send, X, Upload
} from "lucide-react";

// Simulated client mudanza ID (in production this comes from auth)
const DEMO_MUDANZA_ID = "b1111111-1111-1111-1111-111111111111";

const estadosTimeline = [
  { estado: "inspeccion", label: "Inspección", icon: "🔍" },
  { estado: "cotizacion", label: "Cotización", icon: "💰" },
  { estado: "booking", label: "Booking", icon: "📋" },
  { estado: "empaque", label: "Empaque", icon: "📦" },
  { estado: "bodega", label: "Bodega", icon: "🏭" },
  { estado: "despacho", label: "Despacho", icon: "🚛" },
  { estado: "transito", label: "Tránsito", icon: "🚢" },
  { estado: "aduana", label: "Aduana", icon: "🛃" },
  { estado: "entrega", label: "Entrega", icon: "🏠" },
  { estado: "cerrado", label: "Cerrado", icon: "✅" },
];

export default function PortalCliente() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "system", text: "¡Hola! Soy tu asistente de ABC Moving. ¿En qué puedo ayudarte?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const { data: mudanza, isLoading } = useQuery({
    queryKey: ["portal-mudanza", DEMO_MUDANZA_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mudanzas")
        .select(`
          *,
          cliente:clientes(*),
          inventario(*),
          documentos(*)
        `)
        .eq("id", DEMO_MUDANZA_ID)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const getEstadoIndex = (estado: string) =>
    estadosTimeline.findIndex((e) => e.estado === estado);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { from: "user", text: chatInput },
      { from: "system", text: "Gracias por tu mensaje. Un coordinador te responderá pronto." },
    ]);
    setChatInput("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!mudanza) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">No se encontró información de tu mudanza.</p>
      </div>
    );
  }

  const estadoActualIndex = getEstadoIndex(mudanza.estado);
  const progressPct = Math.round(((estadoActualIndex + 1) / estadosTimeline.length) * 100);

  // Group inventory by room
  const inventarioByRoom: Record<string, typeof mudanza.inventario> = {};
  (mudanza.inventario || []).forEach((item: any) => {
    const room = item.habitacion || "Sin asignar";
    if (!inventarioByRoom[room]) inventarioByRoom[room] = [];
    inventarioByRoom[room].push(item);
  });

  const totalVolumen = (mudanza.inventario || []).reduce(
    (sum: number, i: any) => sum + (i.volumen || 0), 0
  );
  const totalPeso = (mudanza.inventario || []).reduce(
    (sum: number, i: any) => sum + (i.peso || 0), 0
  );

  const condicionColor = (c: string) => {
    switch (c) {
      case "excelente": return "bg-accent/10 text-accent";
      case "buena": return "bg-primary/10 text-primary";
      case "regular": return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
      case "dañado": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const docEstadoStyle = (estado: string | null) => {
    if (estado === "aprobado") return { className: "bg-accent/10 text-accent border-accent/20", label: "Aprobado" };
    return { className: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20", label: "Pendiente" };
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <span className="font-bold text-lg">ABC Moving</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 mr-1" />
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Hola, {mudanza.cliente?.nombre?.split(" ")[0] || "Cliente"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Mudanza <span className="font-mono font-semibold text-foreground">{mudanza.numero}</span>
          </p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progreso</span>
              <Badge className="bg-accent text-accent-foreground">{progressPct}%</Badge>
            </div>
            <Progress value={progressPct} className="h-3" />

            {/* Timeline Steps */}
            <div className="space-y-1 pt-2">
              {estadosTimeline.map((step, index) => {
                const isCompleted = index < estadoActualIndex;
                const isCurrent = index === estadoActualIndex;
                const isPending = index > estadoActualIndex;

                return (
                  <div
                    key={step.estado}
                    className={`flex items-center gap-3 py-1.5 px-2 rounded-md text-sm ${
                      isCurrent ? "bg-accent/10 font-semibold" : ""
                    }`}
                  >
                    <span className="text-base w-6 text-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 inline" />
                      ) : isCurrent ? (
                        <Clock className="w-5 h-5 text-accent inline animate-pulse" />
                      ) : (
                        <span className="text-muted-foreground/40">{step.icon}</span>
                      )}
                    </span>
                    <span className={isPending ? "text-muted-foreground/50" : "text-foreground"}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <Badge variant="outline" className="ml-auto text-[10px] border-accent text-accent">
                        En curso
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Move Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Datos de tu Mudanza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Origen</p>
                <p className="font-medium">{mudanza.origen_ciudad}, {mudanza.origen_pais}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Destino</p>
                <p className="font-medium">{mudanza.destino_ciudad}, {mudanza.destino_pais}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Tipo Servicio</p>
                <p className="font-medium capitalize">{mudanza.tipo?.replace("_", " ")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Transporte</p>
                <p className="font-medium capitalize">{mudanza.modo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha Est.</p>
                <p className="font-medium">{mudanza.fecha_estimada || "Por confirmar"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><Box className="w-3 h-3" /> Volumen</p>
                <p className="font-medium">{mudanza.volumen_estimado || "—"} m³</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Tu Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(inventarioByRoom).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay ítems registrados aún.
              </p>
            ) : (
              Object.entries(inventarioByRoom).map(([room, items]) => (
                <div key={room}>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    🏠 {room}
                    <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
                  </h4>
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.descripcion}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${condicionColor(item.condicion)}`}>
                              {item.condicion}
                            </span>
                            {item.condicion === "dañado" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Daño
                              </span>
                            )}
                            {item.embalaje && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {item.embalaje}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))
            )}

            {/* Totals */}
            {(mudanza.inventario || []).length > 0 && (
              <div className="flex items-center justify-around pt-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{(mudanza.inventario || []).length}</p>
                  <p className="text-[11px] text-muted-foreground">Ítems</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-lg font-bold text-foreground">{totalVolumen.toFixed(1)}</p>
                  <p className="text-[11px] text-muted-foreground">m³</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-lg font-bold text-foreground">{totalPeso.toFixed(0)}</p>
                  <p className="text-[11px] text-muted-foreground">kg</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(mudanza.documentos || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay documentos disponibles aún.
              </p>
            ) : (
              (mudanza.documentos || []).map((doc: any) => {
                const style = docEstadoStyle(doc.estado);
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nombre}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{doc.tipo}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${style.className}`}>
                      {style.label}
                    </Badge>
                  </div>
                );
              })
            )}
            <Button variant="outline" className="w-full mt-2" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Subir documento
            </Button>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Gestiona tus pagos de forma segura a través de nuestro portal.
            </p>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <CreditCard className="w-4 h-4 mr-2" />
              Realizar pago
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Floating Help Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
        aria-label="Ayuda"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">¿Necesitas ayuda?</span>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setChatOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.from === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex gap-2">
            <input
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Escribe tu mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            />
            <Button size="icon" className="rounded-full bg-accent hover:bg-accent/90" onClick={handleSendChat}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}