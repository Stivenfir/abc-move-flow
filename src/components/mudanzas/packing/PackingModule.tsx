import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackingList } from "./PackingList";
import { InventarioForm } from "./InventarioForm";
import { PackingListGenerator } from "./PackingListGenerator";
import { Package, ListChecks, FileText, Users } from "lucide-react";

interface PackingModuleProps {
  mudanzaId: string;
  mudanzaNumero: string;
  clienteNombre: string;
}

export function PackingModule({ mudanzaId, mudanzaNumero, clienteNombre }: PackingModuleProps) {
  const [activeTab, setActiveTab] = useState("inventario");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Módulo de Empaque y Control de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventario" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="cuadrilla" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cuadrilla
            </TabsTrigger>
            <TabsTrigger value="packing-list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Packing List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventario" className="space-y-4">
            <InventarioForm mudanzaId={mudanzaId} />
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <PackingList mudanzaId={mudanzaId} />
          </TabsContent>

          <TabsContent value="cuadrilla" className="space-y-4">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Control de Cuadrillas</h3>
              <p className="text-muted-foreground mb-4">
                Asigna personal y controla tiempos de empaque
              </p>
              <Button>Asignar Cuadrilla</Button>
            </div>
          </TabsContent>

          <TabsContent value="packing-list" className="space-y-4">
            <PackingListGenerator 
              mudanzaId={mudanzaId}
              mudanzaNumero={mudanzaNumero}
              clienteNombre={clienteNombre}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
