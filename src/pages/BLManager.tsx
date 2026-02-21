import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function BLManager() {
  return (
    <div className="container-dashboard space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Gestión de BL</h1>
        <p className="text-sm text-muted-foreground">Bills of Lading asociados a operaciones</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Módulo de BL</h3>
          <p className="text-muted-foreground max-w-md">
            Gestión de Bills of Lading (BL) — Drafts, revisiones y BL finales vinculados a las operaciones de exportación e importación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
