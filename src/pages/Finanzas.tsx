import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, FileText, Plus, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444"];

export default function Finanzas() {
  const { data: costos } = useQuery({
    queryKey: ["costos-finanzas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("costos")
        .select("*, mudanza:mudanzas(numero, cliente:clientes(nombre))")
        .order("fecha", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: mudanzas } = useQuery({
    queryKey: ["mudanzas-finanzas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("mudanzas").select("id, numero, valor_declarado, estado, cliente:clientes(nombre)");
      if (error) throw error;
      return data || [];
    },
  });

  const totalCostos = costos?.reduce((s, c) => s + Number(c.monto || 0), 0) || 0;
  const totalValorDeclarado = mudanzas?.reduce((s, m) => s + Number(m.valor_declarado || 0), 0) || 0;
  const margen = totalValorDeclarado > 0 ? ((totalValorDeclarado - totalCostos) / totalValorDeclarado * 100) : 0;
  const pendientes = costos?.filter(c => c.estado === "pendiente").length || 0;

  // Costos por proveedor
  const proveedorMap: Record<string, number> = {};
  costos?.forEach(c => {
    const key = c.proveedor || "Sin proveedor";
    proveedorMap[key] = (proveedorMap[key] || 0) + Number(c.monto || 0);
  });
  const proveedorData = Object.entries(proveedorMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Costos por estado
  const estadoCostoData = [
    { name: "Pagado", value: costos?.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
    { name: "Pendiente", value: costos?.filter(c => c.estado === "pendiente").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
    { name: "Aprobado", value: costos?.filter(c => c.estado === "aprobado").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finanzas y Costeo</h1>
            <p className="text-muted-foreground">Control de costos, márgenes y facturación</p>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" /> Integración Siigo: próximamente
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Costos Totales" value={`$${totalCostos.toLocaleString()}`} icon={TrendingDown} />
          <StatsCard title="Valor Declarado" value={`$${totalValorDeclarado.toLocaleString()}`} icon={DollarSign} />
          <StatsCard
            title="Margen Estimado"
            value={`${margen.toFixed(1)}%`}
            icon={TrendingUp}
          />
          <StatsCard title="Costos Pendientes" value={pendientes} icon={FileText} />
        </div>

        <Tabs defaultValue="detalle">
          <TabsList>
            <TabsTrigger value="detalle">Detalle de Costos</TabsTrigger>
            <TabsTrigger value="analisis">Análisis</TabsTrigger>
            <TabsTrigger value="margen">Margen por Mudanza</TabsTrigger>
          </TabsList>

          <TabsContent value="detalle">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos Costos Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                {costos && costos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mudanza</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costos.slice(0, 20).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{(c as any).mudanza?.numero || "—"}</TableCell>
                          <TableCell>{c.concepto}</TableCell>
                          <TableCell>{c.proveedor || "—"}</TableCell>
                          <TableCell className="text-right font-mono">${Number(c.monto).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={c.estado === "pagado" ? "default" : c.estado === "pendiente" ? "destructive" : "secondary"}>
                              {c.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{new Date(c.fecha).toLocaleDateString("es")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay costos registrados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analisis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Costos por Proveedor</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={proveedorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Estado de Pagos</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={estadoCostoData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toLocaleString()}`}>
                        {estadoCostoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="margen">
            <Card>
              <CardHeader><CardTitle className="text-base">Margen por Mudanza</CardTitle></CardHeader>
              <CardContent>
                {mudanzas && mudanzas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mudanza</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor Declarado</TableHead>
                        <TableHead className="text-right">Costos</TableHead>
                        <TableHead className="text-right">Margen</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mudanzas.slice(0, 20).map(m => {
                        const costosM = costos?.filter(c => c.mudanza_id === m.id).reduce((s, c) => s + Number(c.monto || 0), 0) || 0;
                        const valorD = Number(m.valor_declarado || 0);
                        const margenM = valorD > 0 ? ((valorD - costosM) / valorD * 100) : 0;
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.numero}</TableCell>
                            <TableCell>{(m as any).cliente?.nombre || "—"}</TableCell>
                            <TableCell className="text-right font-mono">${valorD.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">${costosM.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-mono font-bold ${margenM >= 0 ? "text-primary" : "text-destructive"}`}>
                              {margenM.toFixed(1)}%
                            </TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{m.estado}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay mudanzas registradas</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
