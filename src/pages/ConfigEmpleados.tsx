import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, Users, UserCheck, UserX } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface Empleado {
  id: string;
  tipoPersona: string;
  categoriaPersona: string;
  nombres: string;
  apellidos: string;
  genero: string;
  noIdentificacion: string;
  tipoIdentificacion: string;
  sucursal: string;
  dependencia: string;
  cargo: string;
  direccion: string;
  ciudad: string;
  telefono1: string;
  telefono2: string;
  celular: string;
  email: string;
  login: string;
  inactiva: boolean;
  bloqueada: boolean;
}

const mockEmpleados: Empleado[] = [
  { id: "1", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Carlos", apellidos: "Mendoza", genero: "M", noIdentificacion: "79.123.456", tipoIdentificacion: "CC", sucursal: "Bogotá", dependencia: "Comercial", cargo: "Ejecutivo Comercial", direccion: "Cra 15 # 80-22", ciudad: "Bogotá", telefono1: "601 234 5678", telefono2: "", celular: "310 123 4567", email: "cmendoza@abccargo.com", login: "cmendoza", inactiva: false, bloqueada: false },
  { id: "2", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Ana", apellidos: "García", genero: "F", noIdentificacion: "52.234.567", tipoIdentificacion: "CC", sucursal: "Bogotá", dependencia: "Comercial", cargo: "Ejecutiva Comercial", direccion: "Cll 100 # 15-30", ciudad: "Bogotá", telefono1: "601 345 6789", telefono2: "", celular: "311 234 5678", email: "agarcia@abccargo.com", login: "agarcia", inactiva: false, bloqueada: false },
  { id: "3", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Luisa", apellidos: "Rodríguez", genero: "F", noIdentificacion: "63.345.678", tipoIdentificacion: "CC", sucursal: "Medellín", dependencia: "Comercial", cargo: "Ejecutiva Comercial", direccion: "Cra 43A # 7-50", ciudad: "Medellín", telefono1: "604 456 7890", telefono2: "", celular: "312 345 6789", email: "lrodriguez@abccargo.com", login: "lrodriguez", inactiva: false, bloqueada: false },
  { id: "4", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Miguel", apellidos: "Torres", genero: "M", noIdentificacion: "80.456.789", tipoIdentificacion: "CC", sucursal: "Bogotá", dependencia: "Sistemas", cargo: "Administrador TI", direccion: "Cll 72 # 10-45", ciudad: "Bogotá", telefono1: "601 567 8901", telefono2: "601 567 8902", celular: "313 456 7890", email: "mtorres@abccargo.com", login: "mtorres", inactiva: false, bloqueada: false },
  { id: "5", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Sandra", apellidos: "Díaz", genero: "F", noIdentificacion: "51.567.890", tipoIdentificacion: "CC", sucursal: "Buenaventura", dependencia: "Operaciones", cargo: "Coordinadora Operativa", direccion: "Cll 1 # 3-22", ciudad: "Buenaventura", telefono1: "602 678 9012", telefono2: "", celular: "314 567 8901", email: "sdiaz@abccargo.com", login: "sdiaz", inactiva: false, bloqueada: false },
  { id: "6", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Jorge", apellidos: "Vargas", genero: "M", noIdentificacion: "79.678.901", tipoIdentificacion: "CC", sucursal: "Bogotá", dependencia: "Finanzas", cargo: "Analista Financiero", direccion: "Cra 7 # 32-16", ciudad: "Bogotá", telefono1: "601 789 0123", telefono2: "", celular: "315 678 9012", email: "jvargas@abccargo.com", login: "jvargas", inactiva: false, bloqueada: false },
  { id: "7", tipoPersona: "Natural", categoriaPersona: "Empleado", nombres: "Patricia", apellidos: "Moreno", genero: "F", noIdentificacion: "42.789.012", tipoIdentificacion: "CC", sucursal: "Cartagena", dependencia: "Aduanas", cargo: "Auxiliar Aduanera", direccion: "Cll 30 # 18-55", ciudad: "Cartagena", telefono1: "605 890 1234", telefono2: "", celular: "316 789 0123", email: "pmoreno@abccargo.com", login: "pmoreno", inactiva: true, bloqueada: false },
  { id: "8", tipoPersona: "Natural", categoriaPersona: "Contratista", nombres: "Ricardo", apellidos: "Sánchez", genero: "M", noIdentificacion: "80.890.123", tipoIdentificacion: "CC", sucursal: "Bogotá", dependencia: "Transporte", cargo: "Conductor", direccion: "Cra 68 # 45-12", ciudad: "Bogotá", telefono1: "601 901 2345", telefono2: "", celular: "317 890 1234", email: "rsanchez@abccargo.com", login: "rsanchez", inactiva: false, bloqueada: true },
];

export default function ConfigEmpleados() {
  const [busqueda, setBusqueda] = useState("");
  const [seccion1Open, setSeccion1Open] = useState(true);
  const [seccion2Open, setSeccion2Open] = useState(false);
  const [seccion3Open, setSeccion3Open] = useState(false);
  const [seccion4Open, setSeccion4Open] = useState(false);
  const [resultados, setResultados] = useState<Empleado[]>(mockEmpleados);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombres, setFiltroNombres] = useState("");
  const [filtroApellidos, setFiltroApellidos] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filtroInactiva, setFiltroInactiva] = useState(false);
  const [filtroBloqueada, setFiltroBloqueada] = useState(false);

  const activos = mockEmpleados.filter(e => !e.inactiva && !e.bloqueada).length;
  const inactivos = mockEmpleados.filter(e => e.inactiva).length;
  const bloqueados = mockEmpleados.filter(e => e.bloqueada).length;

  const handleConsultar = () => {
    setResultados(mockEmpleados.filter(e => {
      if (filtroCategoria && e.categoriaPersona !== filtroCategoria) return false;
      if (filtroNombres && !e.nombres.toLowerCase().includes(filtroNombres.toLowerCase())) return false;
      if (filtroApellidos && !e.apellidos.toLowerCase().includes(filtroApellidos.toLowerCase())) return false;
      if (filtroCiudad && !e.ciudad.toLowerCase().includes(filtroCiudad.toLowerCase())) return false;
      if (filtroInactiva && !e.inactiva) return false;
      if (filtroBloqueada && !e.bloqueada) return false;
      return true;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Empleados</h1>
        <p className="text-muted-foreground">Gestión de personal y usuarios del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Activos" value={activos} icon={UserCheck} />
        <StatsCard title="Inactivos" value={inactivos} icon={UserX} />
        <StatsCard title="Bloqueados" value={bloqueados} icon={Users} />
      </div>

      {/* Búsqueda Avanzada */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda Avanzada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Sección 1: Clasificación */}
          <Collapsible open={seccion1Open} onOpenChange={setSeccion1Open}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${seccion1Open ? "rotate-180" : ""}`} />
              <span className="font-medium text-sm">Clasificación Principal</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
                <div>
                  <Label className="text-xs">ID</Label>
                  <Input placeholder="Buscar por ID..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tipo Persona</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural">Natural</SelectItem>
                      <SelectItem value="Jurídica">Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Categoría</Label>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empleado">Empleado</SelectItem>
                      <SelectItem value="Contratista">Contratista</SelectItem>
                      <SelectItem value="Tipo Representante">Tipo Representante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Sección 2: Información Básica */}
          <Collapsible open={seccion2Open} onOpenChange={setSeccion2Open}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${seccion2Open ? "rotate-180" : ""}`} />
              <span className="font-medium text-sm">Información Básica</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
                <div><Label className="text-xs">Nombres</Label><Input value={filtroNombres} onChange={e => setFiltroNombres(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Apellidos</Label><Input value={filtroApellidos} onChange={e => setFiltroApellidos(e.target.value)} className="mt-1" /></div>
                <div>
                  <Label className="text-xs">Género</Label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Femenino</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">No. Identificación</Label><Input className="mt-1" /></div>
                <div>
                  <Label className="text-xs">Tipo Identificación</Label>
                  <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent><SelectItem value="CC">CC</SelectItem><SelectItem value="CE">CE</SelectItem><SelectItem value="NIT">NIT</SelectItem><SelectItem value="Pasaporte">Pasaporte</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Sucursal</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Dependencia</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Cargo</Label><Input className="mt-1" /></div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Sección 3: Ubicación */}
          <Collapsible open={seccion3Open} onOpenChange={setSeccion3Open}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${seccion3Open ? "rotate-180" : ""}`} />
              <span className="font-medium text-sm">Ubicación</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
                <div><Label className="text-xs">Dirección</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Ciudad</Label><Input value={filtroCiudad} onChange={e => setFiltroCiudad(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Teléfono 1</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Teléfono 2</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Celular</Label><Input className="mt-1" /></div>
                <div><Label className="text-xs">Email</Label><Input className="mt-1" /></div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Sección 4: Auditoría */}
          <Collapsible open={seccion4Open} onOpenChange={setSeccion4Open}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${seccion4Open ? "rotate-180" : ""}`} />
              <span className="font-medium text-sm">Auditoría</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3">
                <div><Label className="text-xs">Login</Label><Input className="mt-1" /></div>
                <div className="flex items-center gap-2 mt-5">
                  <Checkbox id="inactiva" checked={filtroInactiva} onCheckedChange={v => setFiltroInactiva(!!v)} />
                  <Label htmlFor="inactiva" className="text-sm">Persona Inactiva</Label>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <Checkbox id="bloqueada" checked={filtroBloqueada} onCheckedChange={v => setFiltroBloqueada(!!v)} />
                  <Label htmlFor="bloqueada" className="text-sm">Persona Bloqueada</Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end pt-2">
            <Button onClick={handleConsultar}>
              <Search className="w-4 h-4 mr-2" />Consultar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({resultados.length} empleados)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>Dependencia</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultados.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono">{e.id}</TableCell>
                    <TableCell>{e.nombres}</TableCell>
                    <TableCell>{e.apellidos}</TableCell>
                    <TableCell className="font-mono">{e.tipoIdentificacion} {e.noIdentificacion}</TableCell>
                    <TableCell>{e.cargo}</TableCell>
                    <TableCell>{e.sucursal}</TableCell>
                    <TableCell>{e.dependencia}</TableCell>
                    <TableCell className="text-sm">{e.email}</TableCell>
                    <TableCell className="font-mono">{e.login}</TableCell>
                    <TableCell>
                      {e.bloqueada ? <Badge variant="destructive">Bloqueado</Badge> :
                       e.inactiva ? <Badge variant="secondary">Inactivo</Badge> :
                       <Badge className="bg-green-600 text-white">Activo</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
