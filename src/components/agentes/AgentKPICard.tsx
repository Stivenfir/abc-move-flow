import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
}

export function AgentKPICard({
  title,
  value,
  icon: Icon,
  trend,
  onClick,
}: AgentKPICardProps) {
  return (
    <Card
      className={cn("card-hover", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                <span>{trend.positive ? "↑" : "↓"}</span>
                <span>{trend.value}</span>
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
