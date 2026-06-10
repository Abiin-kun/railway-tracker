import type { TrainStatusDataSource } from "@/lib/api-client";
import { Badge } from "./ui/badge";

const BADGE_CONFIG: Record<string, { cls: string; label: string; pulse?: boolean }> = {
  Live: { cls: "border-green-500/30 text-green-500 bg-green-500/10 gap-1.5", label: "Live", pulse: true },
  Estimated: { cls: "border-blue-500/30 text-blue-400 bg-blue-500/10", label: "Estimated" },
  Scheduled: { cls: "border-muted text-muted-foreground bg-muted/20", label: "Scheduled" },
};

interface DataSourceBadgeProps {
  source: TrainStatusDataSource;
  className?: string;
}

export default function DataSourceBadge({ source, className = "" }: DataSourceBadgeProps) {
  const cfg = BADGE_CONFIG[source] ?? BADGE_CONFIG["Scheduled"];
  return (
    <Badge variant="outline" className={`px-2 py-0.5 ${cfg.cls} ${className}`}>
      {cfg.pulse && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {cfg.label}
    </Badge>
  );
}
