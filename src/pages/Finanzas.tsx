import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, FileText, Plus, AlertTriangle, Search, ShoppingCart, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function MargenBadge({ margen }: { margen: number }) {
  if (margen >= 15) return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">🟢 {margen.toFixed(1)}%</Badge>;
  if (margen >= 5) return <Badge className="bg-amber-500/15 text-amber-700 border-amber-200">🟡 {margen.toFixed(1)}%</Badge>;
  return <Badge className="bg-red-500/15 text-red-700 border-red-200">🔴 {margen.toFixed(1)}%</Badge>;
}

function EstadoPagoBadge({ estado }: { estado: string | null }) {
  const map: Record<string, string> = {
    pagado: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
    pendiente: "bg-red-500/15 text-red-700 border-red-200",
    aprobado: "bg-blue-500/15 text-blue-700 border-blue-200",
  };
  return <Badge className={map[estado || ""] || "bg-muted text-muted-foreground"}>{estado || "—"}</Badge>;
}

export default function Finanzas() {
  const [searchCostos, setSearchCostos] = useState("");

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
  const margenGlobal = totalValorDeclarado > 0 ? ((totalValorDeclarado - totalCostos) / totalValorDeclarado * 100) : 0;
  const pendientes = costos?.filter(c => c.estado === "pendiente").length || 0;

  const proveedorMap: Record<string, number> = {};
  costos?.forEach(c => {
    const key = c.proveedor || "Sin proveedor";
    proveedorMap[key] = (proveedorMap[key] || 0) + Number(c.monto || 0);
  });
  const proveedorData = Object.entries(proveedorMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const estadoCostoData = [
    { name: "Pagado", value: costos?.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
    { name: "Pendiente", value: costos?.filter(c => c.estado === "pendiente").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
    { name: "Aprobado", value: costos?.filter(c => c.estado === "aprobado").reduce((s, c) => s + Number(c.monto || 0), 0) || 0 },
  ].filter(d => d.value > 0);

  const filteredCostos = costos?.filter(c => {
    if (!searchCostos) return true;
    const term = searchCostos.toLowerCase();
    return c.concepto?.toLowerCase().includes(term) ||
      c.proveedor?.toLowerCase().includes(term) ||
      (c as any).mudanza?.numero?.toLowerCase().includes(term) ||
      (c as any).mudanza?.cliente?.nombre?.toLowerCase().includes(term);
  });

  // Órdenes de compra mock (grouped by proveedor)
  const ordenesPorProveedor = Object.entries(proveedorMap).map(([proveedor, total]) => {
    const items = costos?.filter(c => (c.proveedor || "Sin proveedor") === proveedor) || [];
    const pagados = items.filter(c => c.estado === "pagado").reduce((s, c) => s + Number(c.monto || 0), 0);
    const pendientesP = items.filter(c => c.estado === "pendiente").reduce((s, c) => s + Number(c.monto || 0), 0);
    return { proveedor, total, pagados, pendientes: pendientesP, count: items.length };
  }).sort((a, b) => b.total - a.total);

  return (
      <div className="container-dashboard space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Finanzas y Costeo</h1>
            <p className="text-muted-foreground">Control de costos, márgenes y facturación</p>
          </div>
          <Badge variant="outline" className="text-muted-foreground border-dashed">
            <AlertTriangle className="w-3 h-3 mr-1" /> Integración Siigo: próximamente
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Costos Totales" value={`$${totalCostos.toLocaleString()}`} icon={TrendingDown} />
          <StatsCard title="Valor Facturado" value={`$${totalValorDeclarado.toLocaleString()}`} icon={DollarSign} />
          <StatsCard title="Margen Bruto %" value={`${margenGlobal.toFixed(1)}%`} icon={TrendingUp} />
          <StatsCard title="Facturas Pendientes" value={pendientes} icon={FileText} />
        </div>

        <Tabs defaultValue="costos">
          <TabsList>
            <TabsTrigger value="costos">Costos por Mudanza</TabsTrigger>
            <TabsTrigger value="margen">Análisis de Margen</TabsTrigger>
            <TabsTrigger value="ordenes">Órdenes de Compra</TabsTrigger>
            <TabsTrigger value="analisis">Análisis Visual</TabsTrigger>
          </TabsList>

          {/* Tab 1: Costos por Mudanza */}
          <TabsContent value="costos">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Costos Registrados</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar mudanza, concepto..." className="pl-8" value={searchCostos} onChange={e => setSearchCostos(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                {filteredCostos && filteredCostos.length > 0 ? (
                  <div className="overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mudanza</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Moneda</TableHead>
                          <TableHead>Estado Pago</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCostos.slice(0, 30).map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium font-mono text-xs">{(c as any).mudanza?.numero || "—"}</TableCell>
                            <TableCell>{(c as any).mudanza?.cliente?.nombre || "—"}</TableCell>
                            <TableCell>{c.concepto}</TableCell>
                            <TableCell className="text-right font-mono font-medium">${Number(c.monto).toLocaleString()}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{c.moneda || "USD"}</Badge></TableCell>
                            <TableCell><EstadoPagoBadge estado={c.estado} /></TableCell>
                            <TableCell className="text-muted-foreground text-sm">{new Date(c.fecha).toLocaleDateString("es")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay costos registrados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Análisis de Margen con Semáforo */}
          <TabsContent value="margen">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Margen por Mudanza — Semáforo</CardTitle>
                <CardDescription>🟢 Rentable (&gt;15%) · 🟡 Riesgo (5-15%) · 🔴 Pérdida (&lt;5%)</CardDescription>
              </CardHeader>
              <CardContent>
                {mudanzas && mudanzas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mudanza</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor Facturado</TableHead>
                        <TableHead className="text-right">Costos</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-center">Margen</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mudanzas.map(m => {
                        const costosM = costos?.filter(c => c.mudanza_id === m.id).reduce((s, c) => s + Number(c.monto || 0), 0) || 0;
                        const valorD = Number(m.valor_declarado || 0);
                        const utilidad = valorD - costosM;
                        const margenM = valorD > 0 ? ((utilidad) / valorD * 100) : 0;
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium font-mono text-xs">{m.numero}</TableCell>
                            <TableCell>{(m as any).cliente?.nombre || "—"}</TableCell>
                            <TableCell className="text-right font-mono">${valorD.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">${costosM.toLocaleString()}</TableCell>
                            <TableCell className={`text-right font-mono font-semibold ${utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              ${utilidad.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center"><MargenBadge margen={margenM} /></TableCell>
                            <TableCell><Badge variant="outline" className="capitalize text-xs">{m.estado}</Badge></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay mudanzas</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Órdenes de Compra */}
          <TabsContent value="ordenes">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Órdenes de Compra por Proveedor/Agente</CardTitle>
                  <CardDescription>Resumen de costos agrupados por proveedor</CardDescription>
                </div>
                <Button size="sm" variant="outline" disabled>
                  <Plus className="w-4 h-4 mr-1" /> Nueva OC
                </Button>
              </CardHeader>
              <CardContent>
                {ordenesPorProveedor.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proveedor / Agente</TableHead>
                        <TableHead className="text-center"># Facturas</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Pagado</TableHead>
                        <TableHead className="text-right">Pendiente</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordenesPorProveedor.map(o => (
                        <TableRow key={o.proveedor}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {o.proveedor}
                          </TableCell>
                          <TableCell className="text-center">{o.count}</TableCell>
                          <TableCell className="text-right font-mono font-medium">${o.total.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-emerald-600">${o.pagados.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-red-600">${o.pendientes.toLocaleString()}</TableCell>
                          <TableCell>
                            {o.pendientes > 0 ? (
                              <Badge className="bg-amber-500/15 text-amber-700 border-amber-200">Parcial</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200">Al día</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay proveedores registrados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Análisis Visual */}
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
        </Tabs>
    </div>
  );
}
