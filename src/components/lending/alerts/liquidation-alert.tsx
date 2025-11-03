import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Loan {
  id: string;
  healthFactor: number;
  principalUSDC: number;
}

export function LiquidationAlert({ loans }: { loans: Loan[] }) {
  const navigate = useNavigate();

  return (
    <Card className="p-4 border-destructive/50 bg-destructive/5">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-destructive mb-1">
            Liquidation Risk
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {loans.length} of your loans are at risk of liquidation. Add
            collateral or repay debt immediately.
          </p>
          <div className="flex gap-2">
            {loans.map((loan) => (
              <Button
                key={loan.id}
                size="sm"
                variant="outline"
                onClick={() => void navigate(`/position/${loan.id}`)}
                type="button"
              >
                Loan #{loan.id}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
