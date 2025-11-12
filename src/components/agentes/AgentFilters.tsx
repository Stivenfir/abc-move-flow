import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

interface AgentFiltersProps {
  filters: {
    network: string[];
    pais: string;
    ciudad: string;
    status: string;
    search: string;
  };
  onChange: (filters: any) => void;
}

export function AgentFilters({ filters, onChange }: AgentFiltersProps) {
  const networks = ["Harmony", "FIDI", "LACMA"];

  const toggleNetwork = (network: string) => {
    const newNetworks = filters.network.includes(network)
      ? filters.network.filter((n) => n !== network)
      : [...filters.network, network];
    onChange({ ...filters, network: newNetworks });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar agente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nombre del agente..."
                className="pl-9"
                value={filters.search}
                onChange={(e) =>
                  onChange({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          {/* Network */}
          <div>
            <Label>Red</Label>
            <div className="flex flex-col gap-2 mt-2">
              {networks.map((network) => (
                <div key={network} className="flex items-center gap-2">
                  <Checkbox
                    id={network}
                    checked={filters.network.includes(network)}
                    onCheckedChange={() => toggleNetwork(network)}
                  />
                  <Label htmlFor={network} className="cursor-pointer text-sm">
                    {network}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              placeholder="País..."
              value={filters.pais}
              onChange={(e) => onChange({ ...filters, pais: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onChange({ ...filters, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="trial">En evaluación</SelectItem>
                <SelectItem value="paused">En pausa</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
