import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Search, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockClientes, mockProveedores } from "@/lib/logisticsData";

export default function ConfigClientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [tab, setTab] = useState("clientes");

  const clientesFiltrados = mockClientes.filter((c) => {
    const matchBusqueda = !busqueda || c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) || c.nit.includes(busqueda);
    const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const proveedoresFiltrados = mockProveedores.filter((p) => {
    const matchBusqueda = !busqueda || p.razonSocial.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes y Proveedores</h1>
          <p className="text-sm text-muted-foreground">Gestión de terceros jurídicos, proveedores y contactos operativos</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); setBusqueda(""); setFiltroEstado("todos"); }}>
        <TabsList>
          <TabsTrigger value="clientes">Clientes Jurídicos ({mockClientes.length})</TabsTrigger>
          <TabsTrigger value="proveedores">Proveedores ({mockProveedores.length})</TabsTrigger>
        </TabsList>

        <Card className="mt-3">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por razón social o NIT..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="clientes">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead className="text-center">Op. Activas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/configuracion/clientes/${c.id}`)}>
                      <TableCell className="font-medium text-sm">{c.razonSocial}</TableCell>
                      <TableCell className="text-xs font-mono">{c.nit}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{c.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{c.contactoPrincipal}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                      <TableCell className="text-xs">{c.ciudad}</TableCell>
                      <TableCell className="text-center text-sm font-medium">{c.operacionesActivas}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${c.estado === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`} variant="outline">
                          {c.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proveedores">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proveedoresFiltrados.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">{p.razonSocial}</TableCell>
                      <TableCell className="text-xs font-mono">{p.nit}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{p.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{p.contacto}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.email}</TableCell>
                      <TableCell className="text-xs">{p.ciudad}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${p.estado === "Activo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`} variant="outline">
                          {p.estado}
                        </Badge>
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
