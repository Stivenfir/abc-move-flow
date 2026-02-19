
import { useParams, useNavigate } from "react-router-dom";
import { useAgente } from "@/hooks/useAgentes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Send,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AgenteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agente, isLoading } = useAgente(id!);

  if (isLoading) {
    return (
      <div className="container-dashboard space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agente) {
    return (
      <div className="container-dashboard">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Agente no encontrado</h3>
          <Button onClick={() => navigate("/agentes")}>
            Volver a Agentes
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "trial":
        return "bg-warning/10 text-warning border-warning/20";
      case "paused":
        return "bg-muted text-muted-foreground";
      case "blocked":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getNetworkColor = (network: string | null) => {
    switch (network) {
      case "Harmony":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "FIDI":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "LACMA":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Aggregate stats
  const totalStats = agente.stats?.reduce(
    (acc, stat) => ({
      bookings: acc.bookings + (stat.bookings || 0),
      m3_total: acc.m3_total + Number(stat.m3_total || 0),
      revenue: acc.revenue + Number(stat.revenue || 0),
      gross_margin: acc.gross_margin + Number(stat.gross_margin || 0),
      on_time_pct:
        (acc.on_time_pct * acc.count + Number(stat.on_time_pct || 0)) /
        (acc.count + 1),
      doc_ok_pct:
        (acc.doc_ok_pct * acc.count + Number(stat.doc_ok_pct || 0)) /
        (acc.count + 1),
      nps_avg:
        (acc.nps_avg * acc.count + Number(stat.nps_avg || 0)) /
        (acc.count + 1),
      claims_per_100:
        (acc.claims_per_100 * acc.count + Number(stat.claims_per_100 || 0)) /
        (acc.count + 1),
      count: acc.count + 1,
    }),
    {
      bookings: 0,
      m3_total: 0,
      revenue: 0,
      gross_margin: 0,
      on_time_pct: 0,
      doc_ok_pct: 0,
      nps_avg: 0,
      claims_per_100: 0,
      count: 0,
    }
  ) || {
    bookings: 0,
    m3_total: 0,
    revenue: 0,
    gross_margin: 0,
    on_time_pct: 0,
    doc_ok_pct: 0,
    nps_avg: 0,
    claims_per_100: 0,
    count: 0,
  };

  const totalReciprocity = agente.reciprocity?.reduce(
    (acc, rec) => ({
      sent: acc.sent + (rec.sent_services || 0),
      received: acc.received + (rec.received_services || 0),
    }),
    { sent: 0, received: 0 }
  ) || { sent: 0, received: 0 };

  const reciprocityRatio =
    totalReciprocity.sent > 0
      ? totalReciprocity.received / totalReciprocity.sent
      : 0;

  return (
      <div className="container-dashboard space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/agentes")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{agente.nombre}</h1>
                <p className="text-muted-foreground">
                  {agente.ciudad}, {agente.pais}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {agente.network && (
              <Badge className={getNetworkColor(agente.network)}>
                {agente.network}
              </Badge>
            )}
            <Badge className={getStatusColor(agente.status)}>
              {agente.status === "active" && "Activo"}
              {agente.status === "trial" && "En evaluación"}
              {agente.status === "paused" && "En pausa"}
              {agente.status === "blocked" && "Bloqueado"}
              {!agente.status && "N/A"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generar Statement
            </Button>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Notificar
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {agente.contacto_email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">
                    {agente.contacto_telefono || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Zona horaria</p>
                  <p className="font-medium">{agente.time_zone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Moneda</p>
                  <p className="font-medium">
                    {agente.preferred_currency || "USD"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bookeos</p>
                  <p className="text-2xl font-bold">{totalStats.bookings}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volumen (m³)</p>
                  <p className="text-2xl font-bold">
                    {totalStats.m3_total.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margen</p>
                  <p className="text-2xl font-bold text-success">
                    ${totalStats.gross_margin.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reciprocidad</p>
                  <p className="text-2xl font-bold">
                    {reciprocityRatio.toFixed(2)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">On-time %</p>
              <p
                className={`text-2xl font-bold ${
                  totalStats.on_time_pct >= 80
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {totalStats.on_time_pct.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                Documental %
              </p>
              <p
                className={`text-2xl font-bold ${
                  totalStats.doc_ok_pct >= 80 ? "text-success" : "text-warning"
                }`}
              >
                {totalStats.doc_ok_pct.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">NPS</p>
              <p className="text-2xl font-bold">
                {totalStats.nps_avg.toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">
                Reclamos/100
              </p>
              <p className="text-2xl font-bold text-warning">
                {totalStats.claims_per_100.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mudanzas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mudanzas">Mudanzas</TabsTrigger>
            <TabsTrigger value="lanes">Rutas & Cobertura</TabsTrigger>
            <TabsTrigger value="reciprocity">Reciprocidad</TabsTrigger>
            <TabsTrigger value="financials">Cartera</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="mudanzas">
            <Card>
              <CardHeader>
                <CardTitle>Mudanzas Asociadas</CardTitle>
              </CardHeader>
              <CardContent>
                {agente.mudanzas && agente.mudanzas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Mudanza</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Margen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agente.mudanzas.map((move: any) => (
                        <TableRow
                          key={move.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            navigate(`/mudanzas/${move.mudanza?.id}`)
                          }
                        >
                          <TableCell className="font-medium">
                            {move.mudanza?.numero || "N/A"}
                          </TableCell>
                          <TableCell>
                            {move.mudanza?.cliente?.nombre || "N/A"}
                          </TableCell>
                          <TableCell>
                            {move.mudanza?.origen_ciudad},{" "}
                            {move.mudanza?.origen_pais}
                          </TableCell>
                          <TableCell>
                            {move.mudanza?.destino_ciudad},{" "}
                            {move.mudanza?.destino_pais}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{move.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{move.mudanza?.estado}</Badge>
                          </TableCell>
                          <TableCell className="text-success">
                            ${Number(move.revenue_alloc || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay mudanzas asociadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lanes">
            <Card>
              <CardHeader>
                <CardTitle>Rutas y Cobertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Cobertura</h4>
                    <div className="flex flex-wrap gap-2">
                      {agente.cobertura?.map((pais, i) => (
                        <Badge key={i} variant="outline">
                          {pais}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {agente.lanes && agente.lanes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Rutas Fuertes</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Origen</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Modo</TableHead>
                            <TableHead>Servicio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agente.lanes.map((lane: any) => (
                            <TableRow key={lane.id}>
                              <TableCell>
                                {lane.origin_city}, {lane.origin_country}
                              </TableCell>
                              <TableCell>
                                {lane.dest_city}, {lane.dest_country}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{lane.mode}</Badge>
                              </TableCell>
                              <TableCell>{lane.service_type}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reciprocity">
            <Card>
              <CardHeader>
                <CardTitle>Reciprocidad de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Servicios Enviados
                      </p>
                      <p className="text-3xl font-bold">
                        {totalReciprocity.sent}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Servicios Recibidos
                      </p>
                      <p className="text-3xl font-bold">
                        {totalReciprocity.received}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        Ratio
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          reciprocityRatio >= 1
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {reciprocityRatio.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {agente.reciprocity && agente.reciprocity.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4">
                      Histórico (últimos 12 meses)
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Periodo</TableHead>
                          <TableHead>Enviados</TableHead>
                          <TableHead>Recibidos</TableHead>
                          <TableHead>Ratio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agente.reciprocity.map((rec: any) => (
                          <TableRow key={rec.id}>
                            <TableCell>
                              {new Date(rec.period).toLocaleDateString(
                                "es",
                                { year: "numeric", month: "short" }
                              )}
                            </TableCell>
                            <TableCell>{rec.sent_services || 0}</TableCell>
                            <TableCell>{rec.received_services || 0}</TableCell>
                            <TableCell>
                              {Number(rec.reciprocity_ratio || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Cartera & Estados de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                {agente.financials ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-2">
                            AR (Nos deben)
                          </p>
                          <p className="text-3xl font-bold text-success">
                            ${Number(agente.financials.ar_total || 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-2">
                            AP (Debemos)
                          </p>
                          <p className="text-3xl font-bold text-destructive">
                            ${Number(agente.financials.ap_total || 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-2">
                            Neto
                          </p>
                          <p
                            className={`text-3xl font-bold ${
                              Number(agente.financials.net_balance || 0) >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            ${Number(agente.financials.net_balance || 0).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Aging AR</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(
                          agente.financials.ar_aging || {}
                        ).map(([bucket, amount]) => (
                          <Card key={bucket}>
                            <CardContent className="p-4">
                              <p className="text-xs text-muted-foreground mb-1">
                                {bucket} días
                              </p>
                              <p className="text-lg font-bold">
                                ${Number(amount).toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay datos financieros disponibles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                {agente.stats && agente.stats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Bookeos</TableHead>
                        <TableHead>m³</TableHead>
                        <TableHead>On-time %</TableHead>
                        <TableHead>Doc %</TableHead>
                        <TableHead>NPS</TableHead>
                        <TableHead>Reclamos/100</TableHead>
                        <TableHead>Margen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agente.stats.map((stat: any) => (
                        <TableRow key={stat.id}>
                          <TableCell>
                            {new Date(stat.period).toLocaleDateString("es", {
                              year: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell>{stat.bookings || 0}</TableCell>
                          <TableCell>
                            {Number(stat.m3_total || 0).toFixed(1)}
                          </TableCell>
                          <TableCell
                            className={
                              Number(stat.on_time_pct || 0) >= 80
                                ? "text-success"
                                : "text-warning"
                            }
                          >
                            {Number(stat.on_time_pct || 0).toFixed(1)}%
                          </TableCell>
                          <TableCell
                            className={
                              Number(stat.doc_ok_pct || 0) >= 80
                                ? "text-success"
                                : "text-warning"
                            }
                          >
                            {Number(stat.doc_ok_pct || 0).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {Number(stat.nps_avg || 0).toFixed(1)}
                          </TableCell>
                          <TableCell className="text-warning">
                            {Number(stat.claims_per_100 || 0).toFixed(1)}
                          </TableCell>
                          <TableCell className="text-success">
                            ${Number(stat.gross_margin || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay datos de performance disponibles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
