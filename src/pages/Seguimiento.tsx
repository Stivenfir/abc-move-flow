import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, Users, Target, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface SeguimientoItem {
  id: string;
  comercial: string;
  cliente: string;
  solicitudesAbiertas: number;
  cotizacionesEnviadas: number;
  cotizacionesAprobadas: number;
  operacionesActivas: number;
  tasaConversion: number;
  ingresoMes: number;
  ultimaActividad: string;
}

const mockSeguimiento: SeguimientoItem[] = [
  { id: "1", comercial: "Carlos Mendoza", cliente: "MABE COLOMBIA SAS", solicitudesAbiertas: 3, cotizacionesEnviadas: 5, cotizacionesAprobadas: 3, operacionesActivas: 2, tasaConversion: 60, ingresoMes: 45000, ultimaActividad: "2026-02-20" },
  { id: "2", comercial: "Ana García", cliente: "VARISUR SAS", solicitudesAbiertas: 2, cotizacionesEnviadas: 4, cotizacionesAprobadas: 2, operacionesActivas: 1, tasaConversion: 50, ingresoMes: 32000, ultimaActividad: "2026-02-19" },
  { id: "3", comercial: "Luisa Rodríguez", cliente: "WODEN COLOMBIA SAS", solicitudesAbiertas: 1, cotizacionesEnviadas: 3, cotizacionesAprobadas: 2, operacionesActivas: 1, tasaConversion: 67, ingresoMes: 28000, ultimaActividad: "2026-02-18" },
  { id: "4", comercial: "Carlos Mendoza", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS", solicitudesAbiertas: 1, cotizacionesEnviadas: 2, cotizacionesAprobadas: 1, operacionesActivas: 1, tasaConversion: 50, ingresoMes: 18000, ultimaActividad: "2026-02-20" },
  { id: "5", comercial: "Ana García", cliente: "INGERSOLL - RAND COLOMBIA SAS", solicitudesAbiertas: 2, cotizacionesEnviadas: 3, cotizacionesAprobadas: 2, operacionesActivas: 1, tasaConversion: 67, ingresoMes: 35000, ultimaActividad: "2026-02-17" },
  { id: "6", comercial: "Luisa Rodríguez", cliente: "PROMOS LTDA", solicitudesAbiertas: 1, cotizacionesEnviadas: 2, cotizacionesAprobadas: 1, operacionesActivas: 1, tasaConversion: 50, ingresoMes: 12000, ultimaActividad: "2026-02-16" },
  { id: "7", comercial: "Carlos Mendoza", cliente: "POLIEMPAK SAS", solicitudesAbiertas: 1, cotizacionesEnviadas: 1, cotizacionesAprobadas: 1, operacionesActivas: 1, tasaConversion: 100, ingresoMes: 15000, ultimaActividad: "2026-02-15" },
];

export default function Seguimiento() {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = mockSeguimiento.filter(s =>
    s.comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.cliente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalSolicitudes = filtrados.reduce((a, b) => a + b.solicitudesAbiertas, 0);
  const totalCotEnviadas = filtrados.reduce((a, b) => a + b.cotizacionesEnviadas, 0);
  const totalAprobadas = filtrados.reduce((a, b) => a + b.cotizacionesAprobadas, 0);
  const promedioConversion = filtrados.length ? Math.round(filtrados.reduce((a, b) => a + b.tasaConversion, 0) / filtrados.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Seguimiento Comercial</h1>
        <p className="text-muted-foreground">Pipeline comercial y métricas de conversión por ejecutivo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Solicitudes Abiertas" value={totalSolicitudes} icon={Users} />
        <StatsCard title="Cotizaciones Enviadas" value={totalCotEnviadas} icon={Target} />
        <StatsCard title="Cotizaciones Aprobadas" value={totalAprobadas} icon={CheckCircle} />
        <StatsCard title="Tasa Conversión Prom." value={`${promedioConversion}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline por Comercial / Cliente</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comercial</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Solicitudes</TableHead>
                <TableHead className="text-center">Cot. Enviadas</TableHead>
                <TableHead className="text-center">Cot. Aprobadas</TableHead>
                <TableHead className="text-center">Ops. Activas</TableHead>
                <TableHead>Conversión</TableHead>
                <TableHead className="text-right">Ingreso Mes (USD)</TableHead>
                <TableHead>Última Actividad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.comercial}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{s.cliente}</TableCell>
                  <TableCell className="text-center">{s.solicitudesAbiertas}</TableCell>
                  <TableCell className="text-center">{s.cotizacionesEnviadas}</TableCell>
                  <TableCell className="text-center">{s.cotizacionesAprobadas}</TableCell>
                  <TableCell className="text-center">{s.operacionesActivas}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={s.tasaConversion} className="w-16 h-2" />
                      <span className="text-xs font-medium">{s.tasaConversion}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">USD ${s.ingresoMes.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{s.ultimaActividad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
