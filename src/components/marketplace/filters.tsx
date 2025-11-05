"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { MarketplaceFilters, SortOption } from "@/types/lending";
import { useState } from "react";

interface FilterProps {
  filters: MarketplaceFilters;
  onFilterChange: (filters: MarketplaceFilters) => void;
}

export default function MarketplaceFiltersComponent({
  filters,
  onFilterChange,
}: FilterProps) {
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxRate, setMaxRate] = useState<number>(30);
  const [maxDuration, setMaxDuration] = useState<number>(52);
  const [sort, setSort] = useState<SortOption>(filters.sort);

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      minAmount: minAmount
        ? BigInt(Math.floor(Number.parseFloat(minAmount) * 1e6))
        : undefined,
      maxRate,
      maxDuration,
      sort,
    });
  };

  return (
    <Card className="p-6 sticky top-[var(--header-mobile)] lg:top-0 bg-card">
      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">Sort By</Label>
          <div className="space-y-2">
            {(["best-rate", "highest-amount", "newest"] as const).map(
              (option) => (
                <button
                  key={option}
                  onClick={() => setSort(option)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    sort === option
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  {option === "best-rate" && "Best Rate"}
                  {option === "highest-amount" && "Highest Amount"}
                  {option === "newest" && "Newest"}
                </button>
              ),
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="min-amount"
            className="text-base font-semibold mb-3 block"
          >
            Min Amount (USDC)
          </Label>
          <Input
            id="min-amount"
            type="number"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="bg-muted"
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 flex justify-between">
            <span>Max Rate</span>
            <span className="text-primary">{maxRate}%</span>
          </Label>
          <Slider
            value={[maxRate]}
            onValueChange={([v]) => setMaxRate(v)}
            min={0.1}
            max={30}
            step={0.1}
            className="w-full"
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 flex justify-between">
            <span>Max Duration</span>
            <span className="text-primary">{maxDuration}w</span>
          </Label>
          <Slider
            value={[maxDuration]}
            onValueChange={([v]) => setMaxDuration(v)}
            min={1}
            max={52}
            step={1}
            className="w-full"
          />
        </div>

        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
      </div>
    </Card>
  );
}
