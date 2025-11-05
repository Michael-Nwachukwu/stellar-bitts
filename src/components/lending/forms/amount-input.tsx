"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AmountInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: number;
  asset: string;
  balance?: number;
  error?: string;
}

export function AmountInput({
  label,
  value,
  onChange,
  max,
  asset,
  balance,
  error,
}: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="0.00"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg"
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex items-end">
          <span className="text-sm text-muted-foreground px-3 py-2 bg-card rounded-md">
            {asset}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {balance !== undefined && (
          <p className="text-xs text-muted-foreground">
            Balance:{" "}
            {balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {asset}
          </p>
        )}
        {max !== undefined && (
          <Button
            size="xs"
            variant="outline"
            onClick={() => onChange(max.toString())}
            className="h-6 text-xs"
          >
            Max
          </Button>
        )}
      </div>
    </div>
  );
}
