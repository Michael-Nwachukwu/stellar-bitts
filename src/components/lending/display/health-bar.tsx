"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HealthBarProps {
  ratio: number;
  threshold: number;
  size?: "sm" | "md" | "lg";
}

export function HealthBar({ ratio, threshold, size = "md" }: HealthBarProps) {
  const getColor = () => {
    if (ratio > threshold * 1.2) return "bg-success";
    if (ratio > threshold) return "bg-warning";
    return "bg-destructive";
  };

  const sizeClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-4" : "h-2";
  const height = size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative w-full bg-card rounded-lg p-2 ${height} flex items-center`}
          >
            <div className="absolute inset-1 bg-muted rounded-md overflow-hidden">
              <div
                className={`${sizeClass} ${getColor()} transition-all`}
                style={{
                  width: `${Math.min((ratio / (threshold * 1.5)) * 100, 100)}%`,
                }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-border"
              style={{ left: `${(threshold / (threshold * 1.5)) * 100}%` }}
            />
            <span className="relative ml-2 text-xs font-mono font-semibold">
              {(ratio * 100).toFixed(0)}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Health Factor: {ratio.toFixed(2)}</p>
          <p className="text-xs">Liquidation at {threshold.toFixed(2)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
