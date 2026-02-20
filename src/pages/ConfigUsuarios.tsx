import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search } from "lucide-react";
import { mockUsuarios, rolesDisponibles } from "@/lib/logisticsData";

export default function ConfigUsuarios() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");

  const filtrados = mockUsuarios.filter((u) => {
    const matchBusqueda = !busqueda ||
      u.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "todos" || u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  return (
    <div className="container-dashboard space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios por Rol</h1>
          <p className="text-sm text-muted-foreground">Administración de usuarios y asignación de roles ({rolesDisponibles.length} roles disponibles)</p>
        </div>
        <Button className="bg-accent hover:bg-accent-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select value={filtroRol} onValueChange={setFiltroRol}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filtrar por Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Roles</SelectItem>
                {rolesDisponibles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Login</TableHead>
                <TableHead>Nombres</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((u) => (
                <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{u.login}</TableCell>
                  <TableCell className="text-sm">{u.nombres}</TableCell>
                  <TableCell className="text-sm">{u.apellidos}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{u.rol}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${
                        u.estado === "Activo" ? "bg-success/10 text-success" :
                        u.estado === "Bloqueado" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}
                      variant="outline"
                    >
                      {u.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.ultimoAcceso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Mostrando {filtrados.length} de {mockUsuarios.length} usuarios
      </p>
    </div>
  );
}
