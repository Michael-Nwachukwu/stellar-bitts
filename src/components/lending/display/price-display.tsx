"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface PriceDisplayProps {
  symbol: string;
  price: number;
  timestamp?: number;
}

export function PriceDisplay({ symbol, price, timestamp }: PriceDisplayProps) {
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    if (!timestamp) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) setTimeAgo("just now");
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="flex items-center gap-2">
      <div>
        <p className="text-xs text-muted-foreground">{symbol}/USDC</p>
        <p className="text-lg font-mono font-semibold">${price.toFixed(4)}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <RefreshCw className="w-3 h-3" />
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}
