import React, { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { BracketsIcon } from "@/components/icons/brackets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

const XLM_PRICE_USDC = 0.15;

export default function BorrowPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  const mockOffer = {
    id: offerId ?? "",
    lenderId: "GBPD...ABC",
    amountUSTC: 10000,
    weeklyRate: 5,
    minCollateralRatio: 200,
    liquidationThreshold: 125,
    maxDurationWeeks: 52,
  };

  const [formData, setFormData] = useState({
    collateralXLM: "",
    borrowAmount: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const collateralXLM = Number.parseFloat(formData.collateralXLM) || 0;
  const collateralValueUSDC = collateralXLM * XLM_PRICE_USDC;
  const maxBorrowable = collateralValueUSDC * 0.5;
  const borrowAmount = Number.parseFloat(formData.borrowAmount) || 0;
  const debtUSDC = borrowAmount;
  const healthFactor =
    collateralValueUSDC / (debtUSDC * (mockOffer.liquidationThreshold / 100));
  const collateralizationRatio = collateralValueUSDC / (debtUSDC || 1);
  const liquidationPrice =
    (debtUSDC * (mockOffer.liquidationThreshold / 100)) / (collateralXLM || 1);

  const getHealthColor = (health: number) =>
    health > 1.5
      ? "text-success"
      : health > 1.25
        ? "text-warning"
        : "text-destructive";
  const getHealthBgColor = (health: number) =>
    health > 1.5
      ? "bg-success/10"
      : health > 1.25
        ? "bg-warning/10"
        : "bg-destructive/10";

  const handleSubmit = () => {
    if (collateralXLM <= 0 || borrowAmount <= 0)
      return alert("Please enter valid amounts");
    if (borrowAmount > maxBorrowable)
      return alert("Borrow amount exceeds maximum for this collateral");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Borrow",
        description: `Offer #${offerId}`,
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-4">
              Offer Terms (Locked)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Pool Size</p>
                <p className="text-lg font-mono font-semibold">
                  {mockOffer.amountUSTC.toLocaleString()} USDC
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Weekly Rate</p>
                <p className="text-lg font-mono font-semibold">
                  {mockOffer.weeklyRate}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">APY</p>
                <p className="text-lg font-mono font-semibold">
                  {(mockOffer.weeklyRate * 52).toFixed(1)}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Min Collateral</p>
                <p className="text-lg font-mono font-semibold">
                  {mockOffer.minCollateralRatio}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Liquidation</p>
                <p className="text-lg font-mono font-semibold">
                  {mockOffer.liquidationThreshold}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Max Duration</p>
                <p className="text-lg font-mono font-semibold">
                  {mockOffer.maxDurationWeeks}w
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Your Collateral
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="collateral"
                  className="text-base font-semibold mb-2 block"
                >
                  XLM Amount
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="collateral"
                    type="number"
                    placeholder="0.00"
                    value={formData.collateralXLM}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        collateralXLM: e.target.value,
                      })
                    }
                    className="bg-muted text-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, collateralXLM: "1000" })
                    }
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: 1,000 XLM
                </p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Collateral Value (USD)
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  ${collateralValueUSDC.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {collateralXLM.toFixed(2)} XLM @ ${XLM_PRICE_USDC} each
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Borrow Amount
            </h3>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="borrow-amount"
                  className="text-base font-semibold mb-2 block"
                >
                  USDC Amount
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="borrow-amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.borrowAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, borrowAmount: e.target.value })
                    }
                    className="bg-muted text-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        borrowAmount: maxBorrowable.toFixed(2),
                      })
                    }
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max borrowable: ${maxBorrowable.toFixed(2)} (50% LTV)
                </p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Weekly Interest
                </p>
                <p className="text-xl font-semibold text-warning">
                  ${((borrowAmount * mockOffer.weeklyRate) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || borrowAmount <= 0 || collateralXLM <= 0}
            size="lg"
            className="w-full"
          >
            {isSubmitting
              ? "Approving & Borrowing..."
              : "Approve Collateral & Borrow"}
          </Button>
        </div>

        <div>
          <Card className="p-6 sticky top-[var(--header-mobile)] lg:top-0">
            <h3 className="font-semibold text-foreground mb-4">Loan Summary</h3>
            <div className="space-y-4 mb-6">
              <div
                className={`rounded-lg p-4 ${getHealthBgColor(healthFactor)}`}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Health Factor
                </p>
                <p
                  className={`text-2xl font-semibold ${getHealthColor(healthFactor)}`}
                >
                  {isFinite(healthFactor) ? healthFactor.toFixed(2) : "0.00"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthFactor > 1.5
                    ? "Safe"
                    : healthFactor > 1.25
                      ? "Caution"
                      : "At Risk"}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Collateralization Ratio
                </p>
                <p className="text-xl font-mono font-semibold text-foreground">
                  {isFinite(collateralizationRatio)
                    ? (collateralizationRatio * 100).toFixed(0)
                    : "0"}
                  %
                </p>
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Liquidation Price
                </p>
                <p className="text-xl font-mono font-semibold text-destructive">
                  $
                  {isFinite(liquidationPrice)
                    ? liquidationPrice.toFixed(4)
                    : "0.0000"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current: ${XLM_PRICE_USDC}
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-6 border-t border-border text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal</span>
                <span className="text-foreground font-mono">
                  ${borrowAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly Interest</span>
                <span className="text-foreground font-mono">
                  ${((borrowAmount * mockOffer.weeklyRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collateral</span>
                <span className="text-foreground font-mono">
                  {collateralXLM.toFixed(2)} XLM
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Loan Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Loan ID</p>
              <p className="text-2xl font-mono font-semibold text-success">
                #5921
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>Borrowed</span>
                <span className="font-mono">
                  ${borrowAmount.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>Collateral</span>
                <span className="font-mono">
                  {collateralXLM.toFixed(2)} XLM
                </span>
              </div>
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>Health Factor</span>
                <span className="font-mono">{healthFactor.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                onClick={() => void navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setShowSuccessModal(false)}
              >
                View Position Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
