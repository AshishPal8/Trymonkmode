import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export function AdminMetricCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
}: AdminMetricCardProps) {
  return (
    <div className="p-4 rounded-2xl ios-card bg-card border border-border space-y-1">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {title}
        </span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
