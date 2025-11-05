"use client";

import { useEffect, useState } from "react";

interface InterestCounterProps {
  loanId: string;
  principal: number;
  weeklyRate: number;
  startTime: number;
}

export function InterestCounter({
  principal,
  weeklyRate,
  startTime,
}: InterestCounterProps) {
  // const [accruedInterest, setAccruedInterest] = useState(0)
  const [formattedValue, setFormattedValue] = useState("$0.00");

  useEffect(() => {
    const updateInterest = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const weeklyRateDecimal = weeklyRate / 100;
      const secondsPerWeek = 7 * 24 * 60 * 60;
      const interest =
        principal * weeklyRateDecimal * (elapsedSeconds / secondsPerWeek);
      // setAccruedInterest(interest)
      setFormattedValue(`$${interest.toFixed(4)}`);
    };

    updateInterest();
    const interval = setInterval(updateInterest, 1000);
    return () => clearInterval(interval);
  }, [principal, weeklyRate, startTime]);

  return (
    <div className="font-mono">
      <p className="text-xs text-muted-foreground mb-1">Accrued Interest</p>
      <p className="text-lg font-semibold text-warning animate-pulse">
        {formattedValue}
      </p>
      <p className="text-xs text-muted-foreground">
        Accruing at {weeklyRate}% weekly
      </p>
    </div>
  );
}
