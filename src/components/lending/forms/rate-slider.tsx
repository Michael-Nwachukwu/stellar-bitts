"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface RateSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function RateSlider({
  value,
  onChange,
  min = 0.1,
  max = 30,
  step = 0.1,
}: RateSliderProps) {
  const apy = value * 52;

  const getRateColor = (rate: number) => {
    if (rate < 5) return "bg-success/20 text-success";
    if (rate < 15) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Interest Rate</Label>
        <Badge className={getRateColor(value)}>{value}% weekly</Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}%</span>
        <span>APY: {apy.toFixed(1)}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}
