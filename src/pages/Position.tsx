import React, { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { BracketsIcon } from "@/components/icons/brackets";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const XLM_PRICE_USDC = 0.15;
const mockLoanData = {
  id: "5921",
  lenderId: "GBPD...ABC",
  borrowerId: "GXYZ...DEF",
  principalUSDC: 5000,
  collateralXLM: 50000,
  weeklyRate: 5,
  startTime: Date.now() - 604800000,
  status: "active" as const,
};

export default function PositionDetailPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();

  const [realTimeInterest, setRealTimeInterest] = useState(0);
  const [collateralValueUSDC, setCollateralValueUSDC] = useState(
    XLM_PRICE_USDC * mockLoanData.collateralXLM,
  );
  const [healthFactor, setHealthFactor] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showAddCollateralModal, setShowAddCollateralModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const [addCollateralAmount, setAddCollateralAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const calculate = () => {
      const elapsedSeconds = (Date.now() - mockLoanData.startTime) / 1000;
      const weeklyRateDecimal = mockLoanData.weeklyRate / 100;
      const secondsPerWeek = 7 * 24 * 60 * 60;
      const totalInterest =
        mockLoanData.principalUSDC *
        weeklyRateDecimal *
        (elapsedSeconds / secondsPerWeek);
      setRealTimeInterest(totalInterest);
      const totalDebt = mockLoanData.principalUSDC + totalInterest;
      const liquidationThreshold = 125;
      const health =
        collateralValueUSDC / (totalDebt * (liquidationThreshold / 100));
      setHealthFactor(health);
      const xlmLiquidationValue = totalDebt * (liquidationThreshold / 100);
      const liquidPrice = xlmLiquidationValue / mockLoanData.collateralXLM;
      setLiquidationPrice(liquidPrice);
    };
    calculate();
    const it = setInterval(calculate, 1000);
    return () => clearInterval(it);
  }, [collateralValueUSDC]);

  const totalDebt = mockLoanData.principalUSDC + realTimeInterest;
  const collateralizationRatio = collateralValueUSDC / totalDebt;
  const liquidationDistance = collateralValueUSDC - totalDebt * (125 / 100);

  const getHealthColor = (health: number) =>
    health > 1.5
      ? "bg-success/10 text-success border-success/30"
      : health > 1.25
        ? "bg-warning/10 text-warning border-warning/30"
        : "bg-destructive/10 text-destructive border-destructive/30";
  const getHealthStatus = (health: number) =>
    health > 1.5 ? "Safe" : health > 1.25 ? "Caution" : "At Risk";

  return (
    <DashboardPageLayout
      header={{
        title: "Position Details",
        description: `Loan #${loanId}`,
        icon: BracketsIcon,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Loan Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Loan ID</p>
                <p className="font-mono font-semibold">#{mockLoanData.id}</p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className="mt-1 capitalize">{mockLoanData.status}</Badge>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-mono">1 week ago</p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Lender</p>
                <p className="text-sm font-mono">{mockLoanData.lenderId}</p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Borrower</p>
                <p className="text-sm font-mono">{mockLoanData.borrowerId}</p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="font-mono font-semibold">
                  {mockLoanData.weeklyRate}% / week
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Collateral</h3>
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Collateral Deposited
                </p>
                <p className="text-3xl font-semibold text-foreground">
                  {(mockLoanData.collateralXLM / 1e6).toFixed(0)} XLM
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ ${collateralValueUSDC.toFixed(2)} USD
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddCollateralModal(true)}
                >
                  Add Collateral
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Debt</h3>
            <div className="space-y-3">
              <div className="flex justify-between bg-card rounded-lg p-4">
                <span className="text-muted-foreground">
                  Principal Borrowed
                </span>
                <span className="font-mono font-semibold">
                  ${mockLoanData.principalUSDC.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between bg-card rounded-lg p-4">
                <span className="text-muted-foreground">
                  Interest Accrued (Real-time)
                </span>
                <span className="font-mono font-semibold text-warning animate-pulse">
                  ${realTimeInterest.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between bg-card rounded-lg p-4 border border-primary/20">
                <span className="text-foreground font-semibold">
                  Total Debt
                </span>
                <span className="font-mono font-semibold text-primary">
                  ${totalDebt.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={() => setShowRepayModal(true)}
              >
                Repay Debt
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`p-6 border-2 ${getHealthColor(healthFactor)}`}>
            <p className="text-xs text-muted-foreground mb-2">Health Factor</p>
            <p className="text-4xl font-semibold mb-1">
              {healthFactor.toFixed(2)}
            </p>
            <Badge className={getHealthColor(healthFactor)} variant="outline">
              {getHealthStatus(healthFactor)}
            </Badge>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-card rounded-full overflow-hidden">
                <div
                  className={
                    "h-full transition-all " +
                    (healthFactor > 1.5
                      ? "bg-success"
                      : healthFactor > 1.25
                        ? "bg-warning"
                        : "bg-destructive")
                  }
                  style={{ width: `${Math.min(healthFactor * 33.33, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1.0x</span>
                <span>1.5x</span>
              </div>
            </div>
          </Card>

          {healthFactor < 1.3 && (
            <Card className="p-4 bg-destructive/5 border-destructive/30">
              <div className="flex gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="font-semibold text-destructive">
                  Liquidation Warning
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Your position is at risk. Add collateral or repay debt.
              </p>
              <p className="text-xs font-mono">
                ${liquidationDistance.toFixed(2)} away from liquidation
              </p>
            </Card>
          )}

          <Card className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Collateralization
              </span>
              <span className="font-mono font-semibold">
                {(collateralizationRatio * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Liquidation Price
              </span>
              <span className="font-mono font-semibold text-destructive">
                ${liquidationPrice.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Current XLM Price
              </span>
              <span className="font-mono font-semibold">${XLM_PRICE_USDC}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Distance to Liquidation
              </span>
              <span className="font-mono font-semibold">
                ${liquidationDistance.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showRepayModal} onOpenChange={setShowRepayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Repay Debt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Debt</p>
              <p className="text-2xl font-semibold">${totalDebt.toFixed(2)}</p>
            </div>
            <div>
              <Label htmlFor="repay-amount" className="mb-2 block">
                Repay Amount
              </Label>
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                USDC Balance: 5,000
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setRepayAmount("");
                setShowRepayModal(false);
              }}
              disabled={!repayAmount || Number.parseFloat(repayAmount) <= 0}
            >
              Approve & Repay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddCollateralModal}
        onOpenChange={setShowAddCollateralModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Collateral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Current Health
              </p>
              <p className="text-2xl font-semibold">
                {healthFactor.toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="add-collateral" className="mb-2 block">
                XLM Amount
              </Label>
              <Input
                id="add-collateral"
                type="number"
                placeholder="0.00"
                value={addCollateralAmount}
                onChange={(e) => setAddCollateralAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: 1,000 XLM
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const amount = Number.parseFloat(addCollateralAmount) || 0;
                const newCollateral = mockLoanData.collateralXLM + amount * 1e6;
                setCollateralValueUSDC(XLM_PRICE_USDC * newCollateral);
                setAddCollateralAmount("");
                setShowAddCollateralModal(false);
              }}
              disabled={
                !addCollateralAmount ||
                Number.parseFloat(addCollateralAmount) <= 0
              }
            >
              Approve & Add Collateral
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Collateral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Max Withdrawable
              </p>
              <p className="text-2xl font-semibold">~100 XLM</p>
              <p className="text-xs text-muted-foreground mt-1">
                Keeps health above 150%
              </p>
            </div>
            <div>
              <Label htmlFor="withdraw" className="mb-2 block">
                XLM Amount
              </Label>
              <Input
                id="withdraw"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => setShowWithdrawModal(false)}
              disabled={
                !withdrawAmount || Number.parseFloat(withdrawAmount) <= 0
              }
            >
              Approve & Withdraw
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
