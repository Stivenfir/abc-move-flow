import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BarChart3, TrendingUp, DollarSign, Package, Clock, AlertTriangle, Target, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function Reportes() {
  const { data: mudanzas } = useQuery({
    queryKey: ["mudanzas-reportes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mudanzas").select("*, cliente:clientes(*), costos(*)");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: costos } = useQuery({
    queryKey: ["costos-reportes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("costos").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // KPI calculations
  const total = mudanzas?.length || 0;
  const completadas = mudanzas?.filter(m => m.estado === "cerrado").length || 0;
  const enTransito = mudanzas?.filter(m => ["transito", "en_transito_internacional"].includes(m.estado)).length || 0;
  const ingresoTotal = costos?.reduce((sum, c) => sum + Number(c.monto || 0), 0) || 0;

  // Pipeline data
  const estadoLabels: Record<string, string> = {
    inspeccion: "Inspección", cotizacion: "Cotización", booking: "Booking",
    empaque: "Empaque", bodega: "Bodega", despacho: "Despacho",
    transito: "Tránsito", aduana: "Aduana", entrega: "Entrega", cerrado: "Cerrado",
  };
  const pipelineData = Object.entries(estadoLabels).map(([key, label]) => ({
    name: label,
    count: mudanzas?.filter(m => m.estado === key).length || 0,
  }));

  // Tipo operación distribution
  const tipoOpData = [
    { name: "Exportación", value: mudanzas?.filter(m => m.tipo_operacion === "exportacion").length || 0 },
    { name: "Importación", value: mudanzas?.filter(m => m.tipo_operacion === "importacion").length || 0 },
  ];

  // Top destinos
  const destinoCount: Record<string, number> = {};
  mudanzas?.forEach(m => {
    const key = `${m.destino_ciudad}, ${m.destino_pais}`;
    destinoCount[key] = (destinoCount[key] || 0) + 1;
  });
  const topDestinos = Object.entries(destinoCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Modo transporte
  const modoData = [
    { name: "Marítimo", value: mudanzas?.filter(m => m.modo === "maritimo").length || 0 },
    { name: "Aéreo", value: mudanzas?.filter(m => m.modo === "aereo").length || 0 },
    { name: "Terrestre", value: mudanzas?.filter(m => m.modo === "terrestre").length || 0 },
  ];

  // Monthly trend (fake months from dates)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString("es", { month: "short" });
    const year = d.getFullYear();
    const count = mudanzas?.filter(m => {
      const md = new Date(m.fecha_creacion);
      return md.getMonth() === d.getMonth() && md.getFullYear() === year;
    }).length || 0;
    return { name: month, mudanzas: count };
  });

  // Tipo servicio
  const tipoLabels: Record<string, string> = {
    internacional: "Internacional", diplomatica: "Diplomática", corporativa: "Corporativa",
    privada: "Privada", uav: "UAV", excess_baggage: "Excess Baggage", local: "Local",
  };
  const tipoServData = Object.entries(tipoLabels).map(([key, label]) => ({
    name: label,
    value: mudanzas?.filter(m => m.tipo === key).length || 0,
  })).filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">KPIs operativos, comerciales y financieros</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Mudanzas" value={total} icon={Package} />
          <StatsCard title="En Tránsito" value={enTransito} icon={TrendingUp} />
          <StatsCard title="Completadas" value={completadas} icon={Target} />
          <StatsCard title="Ingresos" value={`$${ingresoTotal.toLocaleString()}`} icon={DollarSign} />
        </div>

        <Tabs defaultValue="operativo">
          <TabsList>
            <TabsTrigger value="operativo">Operativo</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="financiero">Financiero</TabsTrigger>
          </TabsList>

          <TabsContent value="operativo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Pipeline por Estado</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pipelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Export vs Import</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={tipoOpData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {tipoOpData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Tendencia Mensual</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="mudanzas" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Modo de Transporte</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={modoData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {modoData.map((_, i) => <Cell key={i} fill={COLORS[i + 2]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comercial" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Top Destinos</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topDestinos} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Tipo de Servicio</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={tipoServData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {tipoServData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financiero" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <StatsCard title="Costos Totales" value={`$${ingresoTotal.toLocaleString()}`} icon={DollarSign} />
              <StatsCard title="Ticket Promedio" value={`$${total > 0 ? Math.round(ingresoTotal / total).toLocaleString() : 0}`} icon={TrendingUp} />
              <StatsCard title="Mudanzas con Costos" value={costos?.length || 0} icon={Package} />
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Distribución de Costos por Concepto</CardTitle></CardHeader>
              <CardContent>
                {costos && costos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(() => {
                      const conceptoMap: Record<string, number> = {};
                      costos.forEach(c => { conceptoMap[c.concepto] = (conceptoMap[c.concepto] || 0) + Number(c.monto || 0); });
                      return Object.entries(conceptoMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay datos de costos registrados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
