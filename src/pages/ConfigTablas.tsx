import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, DollarSign, Plus } from "lucide-react";
import { mockTasasCambio } from "@/lib/logisticsData";

const localizaciones = [
  { id: "1", pais: "Colombia", codigo: "CO", ciudadesPrincipales: "Bogotá, Medellín, Cali, Barranquilla, Cartagena, Buenaventura, Santa Marta" },
  { id: "2", pais: "Estados Unidos", codigo: "US", ciudadesPrincipales: "Miami, Houston, New York, Los Angeles" },
  { id: "3", pais: "China", codigo: "CN", ciudadesPrincipales: "Shanghai, Shenzhen, Ningbo, Guangzhou" },
  { id: "4", pais: "Alemania", codigo: "DE", ciudadesPrincipales: "Hamburg, Frankfurt, Bremen" },
  { id: "5", pais: "Países Bajos", codigo: "NL", ciudadesPrincipales: "Rotterdam, Amsterdam" },
  { id: "6", pais: "Bélgica", codigo: "BE", ciudadesPrincipales: "Amberes, Bruselas" },
  { id: "7", pais: "Perú", codigo: "PE", ciudadesPrincipales: "Callao, Lima" },
  { id: "8", pais: "Japón", codigo: "JP", ciudadesPrincipales: "Yokohama, Tokyo, Osaka" },
];

export default function ConfigTablas() {
  return (
    <div className="container-dashboard space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tablas Básicas</h1>
        <p className="text-sm text-muted-foreground">Localización geográfica y tasas de cambio</p>
      </div>

      <Tabs defaultValue="localizacion">
        <TabsList>
          <TabsTrigger value="localizacion">Localización Geográfica</TabsTrigger>
          <TabsTrigger value="tasas">Tasas de Cambio</TabsTrigger>
        </TabsList>

        <TabsContent value="localizacion">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Países y Ciudades
                </CardTitle>
                <Button size="sm" className="bg-accent hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-1" /> Agregar País
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Código</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Ciudades Principales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localizaciones.map((loc) => (
                    <TableRow key={loc.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">{loc.codigo}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{loc.pais}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{loc.ciudadesPrincipales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasas">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Tasas de Cambio (Referencia USD)
                </CardTitle>
                <Button size="sm" className="bg-accent hover:bg-accent-hover">
                  <Plus className="w-4 h-4 mr-1" /> Actualizar Tasas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moneda Origen</TableHead>
                    <TableHead>Moneda Destino</TableHead>
                    <TableHead className="text-right">Tasa</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTasasCambio.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-medium text-sm">{t.monedaOrigen}</TableCell>
                      <TableCell className="font-mono text-sm">{t.monedaDestino}</TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {t.tasa.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(t.fecha).toLocaleDateString("es-CO")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
