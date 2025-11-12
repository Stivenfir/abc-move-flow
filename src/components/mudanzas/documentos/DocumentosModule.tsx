import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentList } from "./DocumentList";
import { DocumentTemplates } from "./DocumentTemplates";
import { DocumentGenerator } from "./DocumentGenerator";
import { FileText, Library, Wand2 } from "lucide-react";

interface DocumentosModuleProps {
  mudanzaId: string;
  mudanzaData: any;
}

export function DocumentosModule({ mudanzaId, mudanzaData }: DocumentosModuleProps) {
  const [activeTab, setActiveTab] = useState("lista");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Gestión de Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="plantillas" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="generar" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Generar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <DocumentList mudanzaId={mudanzaId} />
          </TabsContent>

          <TabsContent value="plantillas" className="space-y-4">
            <DocumentTemplates />
          </TabsContent>

          <TabsContent value="generar" className="space-y-4">
            <DocumentGenerator 
              mudanzaId={mudanzaId}
              mudanzaData={mudanzaData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
