import { useState } from "react";
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
import {
  useOffer,
  useBorrow,
  useXlmPrice,
  formatXlmPrice,
} from "@/hooks/lending";
import { formatUsdc, getHealthColor } from "@/lib/lending-utils";

export default function BorrowPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();

  // Fetch real offer data and XLM price
  const { data: offer, isLoading: isOfferLoading } = useOffer(offerId);
  const { data: xlmPriceRaw } = useXlmPrice();
  const xlmPrice = formatXlmPrice(xlmPriceRaw);

  const [formData, setFormData] = useState({
    collateralXLM: "",
    borrowAmount: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLoanId, setCreatedLoanId] = useState<string>("");

  // Use the real mutation hook
  const borrowMutation = useBorrow();

  if (isOfferLoading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Borrow",
          description: `Offer #${offerId}`,
          icon: BracketsIcon,
        }}
      >
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading offer...</p>
        </Card>
      </DashboardPageLayout>
    );
  }

  if (!offer) {
    return (
      <DashboardPageLayout
        header={{
          title: "Borrow",
          description: "Offer not found",
          icon: BracketsIcon,
        }}
      >
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Offer not found</p>
          <Button onClick={() => void navigate("/marketplace")}>
            Back to Marketplace
          </Button>
        </Card>
      </DashboardPageLayout>
    );
  }

  // Calculate values using real offer data and XLM price
  const collateralXLM = Number.parseFloat(formData.collateralXLM) || 0;
  const collateralValueUSDC = collateralXLM * xlmPrice;
  const minCollateralRatio = offer.min_collateral_ratio / 100; // Convert basis points to percentage
  const maxBorrowable = collateralValueUSDC / (minCollateralRatio / 100); // Max borrow based on min collateral ratio
  const borrowAmount = Number.parseFloat(formData.borrowAmount) || 0;
  const debtUSDC = borrowAmount;
  const liquidationThreshold = offer.liquidation_threshold / 100;
  const healthFactor =
    collateralValueUSDC / (debtUSDC * (liquidationThreshold / 100));
  const collateralizationRatio = (collateralValueUSDC / (debtUSDC || 1)) * 100;
  const liquidationPrice =
    (debtUSDC * (liquidationThreshold / 100)) / (collateralXLM || 1);

  const getHealthBgColor = (health: number) =>
    health > 1.5
      ? "bg-success/10"
      : health > 1.25
        ? "bg-warning/10"
        : "bg-destructive/10";

  const handleSubmit = async () => {
    if (collateralXLM <= 0 || borrowAmount <= 0) {
      alert("Please enter valid amounts");
      return;
    }
    if (borrowAmount > maxBorrowable) {
      alert("Borrow amount exceeds maximum for this collateral");
      return;
    }

    try {
      const loanId = await borrowMutation.mutateAsync({
        offerId: offerId!,
        collateralXlm: formData.collateralXLM,
        borrowAmount: formData.borrowAmount,
      });
      setCreatedLoanId(loanId.toString());
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to borrow:", error);
      alert("Failed to borrow. Please try again.");
    }
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
                  {formatUsdc(offer.usdc_amount)}
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Weekly Rate</p>
                <p className="text-lg font-mono font-semibold">
                  {(offer.weekly_interest_rate / 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">APY</p>
                <p className="text-lg font-mono font-semibold">
                  {((offer.weekly_interest_rate / 100) * 52).toFixed(1)}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Min Collateral</p>
                <p className="text-lg font-mono font-semibold">
                  {offer.min_collateral_ratio / 100}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Liquidation</p>
                <p className="text-lg font-mono font-semibold">
                  {offer.liquidation_threshold / 100}%
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Max Duration</p>
                <p className="text-lg font-mono font-semibold">
                  {offer.max_duration_weeks}w
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
                  {collateralXLM.toFixed(2)} XLM @ ${xlmPrice.toFixed(4)} each
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
                    className={`bg-muted text-lg ${
                      borrowAmount > maxBorrowable && borrowAmount > 0
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
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
                {borrowAmount > maxBorrowable && borrowAmount > 0 ? (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    Amount exceeds maximum borrowable of $
                    {maxBorrowable.toFixed(2)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Max borrowable: ${maxBorrowable.toFixed(2)} (50% LTV)
                  </p>
                )}
              </div>
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Weekly Interest
                </p>
                <p className="text-xl font-semibold text-warning">
                  $
                  {(
                    (borrowAmount * (offer.weekly_interest_rate / 100)) /
                    100
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => void handleSubmit()}
            disabled={
              borrowMutation.isPending ||
              borrowAmount <= 0 ||
              collateralXLM <= 0 ||
              borrowAmount > maxBorrowable
            }
            size="lg"
            className="w-full"
          >
            {borrowMutation.isPending
              ? "Approving & Borrowing..."
              : borrowAmount > maxBorrowable
                ? "Amount Exceeds Maximum"
                : "Approve Collateral & Borrow"}
          </Button>
        </div>

        <div>
          <Card className="p-6 sticky top-header-mobile lg:top-0">
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
                    ? collateralizationRatio.toFixed(0)
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
                  Current: ${xlmPrice.toFixed(4)}
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
                  $
                  {(
                    (borrowAmount * (offer.weekly_interest_rate / 100)) /
                    100
                  ).toFixed(2)}
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
                {`# ${createdLoanId}`}
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
