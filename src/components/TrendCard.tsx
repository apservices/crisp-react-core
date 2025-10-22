import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendCardProps {
  title: string;
  value: string;
  change: number;
  period: string;
  trend: "up" | "down" | "stable";
  category: string;
}

const trendColors = {
  up: "text-success",
  down: "text-destructive", 
  stable: "text-muted-foreground"
};

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus
};

export function TrendCard({ title, value, change, period, trend, category }: TrendCardProps) {
  const Icon = TrendIcon[trend];
  
  return (
    <Card className="glass border-glass-border p-4 hover:border-primary/30 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Badge variant="outline" className="border-muted text-muted-foreground mb-2">
            {category}
          </Badge>
          <h3 className="font-semibold text-foreground text-sm mb-1">
            {title}
          </h3>
        </div>
        <Icon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground font-heading">
          {value}
        </p>
        <div className="flex items-center gap-1 text-xs">
          <span className={trendColors[trend]}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-muted-foreground">
            vs {period}
          </span>
        </div>
      </div>
    </Card>
  );
}