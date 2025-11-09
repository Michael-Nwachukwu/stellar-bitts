"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LendingOffer, ViewMode } from "@/types/lending";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface OfferCardProps {
  offer: LendingOffer;
  view: ViewMode;
}

export default function OfferCard({ offer, view }: OfferCardProps) {
  const navigate = useNavigate();
  const amountUSDC = Number(offer.amountUSTC) / 1e7; // USDC uses 7 decimals
  const availableUSDC = Number(offer.availableAmount) / 1e7; // USDC uses 7 decimals

  // Calculate APY from weekly rate
  const apy = offer.weeklyRate * 52;

  // Rate color coding
  const getRateColor = (rate: number) => {
    if (rate < 5) return "bg-success/20 text-success";
    if (rate < 15) return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const handleBorrow = () => {
    void navigate(`/borrow/${offer.id}`);
  };

  if (view === "list") {
    return (
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-foreground">
              {availableUSDC.toFixed(2)} USDC
            </h3>
            <Badge className={getRateColor(offer.weeklyRate)}>
              {offer.weeklyRate}% / week
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {offer.minCollateralRatio}% collateral • {offer.maxDurationWeeks}w
            max • {apy.toFixed(1)}% APY
          </p>
        </div>
        <Button onClick={handleBorrow} size="sm" className="gap-2">
          Borrow <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 flex flex-col hover:border-primary/50 transition-colors h-full">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Available Amount
            </p>
            <h3 className="text-2xl font-semibold text-foreground">
              {availableUSDC.toFixed(0)} USDC
            </h3>
          </div>
          <Badge className={getRateColor(offer.weeklyRate)}>
            {offer.weeklyRate}%
          </Badge>
        </div>
      </div>

      <div className="space-y-3 text-sm mb-6 flex-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Pool</span>
          <span className="text-foreground font-mono">
            {amountUSDC.toFixed(0)} USDC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Weekly Rate</span>
          <span className="text-foreground font-mono">{offer.weeklyRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">APY</span>
          <span className="text-foreground font-mono">{apy.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Min Collateral</span>
          <span className="text-foreground font-mono">
            {offer.minCollateralRatio}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Max Duration</span>
          <span className="text-foreground font-mono">
            {offer.maxDurationWeeks}w
          </span>
        </div>
      </div>

      <Button onClick={handleBorrow} className="w-full gap-2">
        Borrow Now <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  );
}
