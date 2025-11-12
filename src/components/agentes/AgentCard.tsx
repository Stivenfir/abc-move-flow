import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { AgentWithStats } from "@/hooks/useAgentes";
import { useNavigate } from "react-router-dom";

interface AgentCardProps {
  agent: AgentWithStats;
}

export function AgentCard({ agent }: AgentCardProps) {
  const navigate = useNavigate();

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

  const healthScore =
    ((agent.stats?.on_time_pct || 0) * 0.4 +
      (agent.stats?.doc_ok_pct || 0) * 0.3 +
      (agent.stats?.nps_avg || 0) * 0.2 +
      (100 - (agent.stats?.claims_per_100 || 0)) * 0.1) /
    10;

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{agent.nombre}</h3>
                <p className="text-sm text-muted-foreground">
                  {agent.ciudad}, {agent.pais}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {agent.network && (
                <Badge className={getNetworkColor(agent.network)}>
                  {agent.network}
                </Badge>
              )}
              <Badge className={getStatusColor(agent.status)}>
                {agent.status === "active" && "Activo"}
                {agent.status === "trial" && "En evaluación"}
                {agent.status === "paused" && "En pausa"}
                {agent.status === "blocked" && "Bloqueado"}
                {!agent.status && "N/A"}
              </Badge>
            </div>
          </div>

          {/* Certificaciones */}
          {agent.certificaciones && agent.certificaciones.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.certificaciones.slice(0, 3).map((cert, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs bg-success/10 text-success border-success/20"
                >
                  {cert}
                </Badge>
              ))}
              {agent.certificaciones.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.certificaciones.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Package className="w-3 h-3" />
                <span className="text-xs">Bookeos</span>
              </div>
              <p className="text-lg font-bold">
                {agent.stats?.bookings || 0}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">m³</span>
              </div>
              <p className="text-lg font-bold">
                {agent.stats?.m3_total?.toFixed(1) || 0}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs">Margen</span>
              </div>
              <p className="text-lg font-bold text-success">
                ${(agent.stats?.gross_margin || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">Score</span>
              </div>
              <p className="text-lg font-bold">{healthScore.toFixed(0)}</p>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-muted-foreground">On-time:</span>{" "}
                <span
                  className={
                    (agent.stats?.on_time_pct || 0) >= 80
                      ? "text-success font-medium"
                      : "text-warning font-medium"
                  }
                >
                  {agent.stats?.on_time_pct?.toFixed(0) || 0}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Documental:</span>{" "}
                <span
                  className={
                    (agent.stats?.doc_ok_pct || 0) >= 80
                      ? "text-success font-medium"
                      : "text-warning font-medium"
                  }
                >
                  {agent.stats?.doc_ok_pct?.toFixed(0) || 0}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Reciprocidad:</span>{" "}
                <span className="font-medium">
                  {agent.reciprocity?.reciprocity_ratio?.toFixed(2) || 0}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/agentes/${agent.id}`)}
            >
              Ver detalle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
