import DashboardPageLayout from "@/components/dashboard/layout";
import { BracketsIcon } from "@/components/icons/brackets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardChart from "@/components/dashboard/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  useCancelOffer,
  useUserLoansAsBorrowerWithData,
  useUserOffersWithData,
  useWithdrawFromOffer,
} from "@/hooks/lending";
import {
  formatUsdc,
  getHealthColor,
  getHealthStatus,
} from "@/lib/lending-utils";
import { LiquidationAlert } from "@/components/lending/alerts/liquidation-alert";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Positions() {
  const [activeTab, setActiveTab] = useState("borrows");
  const { data: borrowerLoans = [], isLoading: isLoansLoading } =
    useUserLoansAsBorrowerWithData();
  const navigate = useNavigate();
  const { data: offers = [], isLoading: isOffersLoading } =
    useUserOffersWithData();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const cancelOfferMutation = useCancelOffer();
  const withdrawMutation = useWithdrawFromOffer();

  const handleCancelSubmit = () => {
    void (async () => {
      if (!selectedOfferId) return;
      try {
        await cancelOfferMutation.mutateAsync({ offerId: selectedOfferId });
        setShowCancelModal(false);
      } catch (error) {
        console.error("Failed to cancel offer:", error);
        alert(
          `Failed to cancel offer: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    })();
  };

  const borrowLoansForUI = borrowerLoans
    .filter(
      (loan) =>
        loan && loan.loan_id !== undefined && loan.offer_id !== undefined,
    )
    .map((loan) => ({
      id: loan.loan_id.toString(),
      offerId: loan.offer_id.toString(),
      lenderId: loan.lender,
      principalUSDC: Number(
        formatUsdc(loan.borrowed_amount || BigInt(0)).replace(/,/g, ""),
      ),
      collateralXLM: Number(loan.collateral_amount || BigInt(0)) / 10000000,
      weeklyRate: (loan.interest_rate || 0) / 100,
      startTime: Number(loan.start_time || BigInt(0)) * 1000,
      accumulatedInterestUSDC: Number(
        formatUsdc(loan.accumulated_interest || BigInt(0)).replace(/,/g, ""),
      ),
      healthFactor: 1.5, // Will be fetched from useLoanHealth in Position page
      status: "active" as const,
    }));

  const handleWithdrawClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setWithdrawAmount("");
    setShowWithdrawModal(true);
  };

  const handleCancelClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowCancelModal(true);
  };

  const handleWithdrawSubmit = () => {
    void (async () => {
      if (!selectedOfferId || !withdrawAmount) return;
      try {
        await withdrawMutation.mutateAsync({
          offerId: selectedOfferId,
          amount: withdrawAmount,
        });
        setShowWithdrawModal(false);
        setWithdrawAmount("");
      } catch (error) {
        console.error("Failed to withdraw:", error);
        alert(
          `Failed to withdraw: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    })();
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Positions",
        description: "Positions Overview",
        icon: BracketsIcon,
      }}
    >
      <div className="mb-6 shrink-0">
        <DashboardChart />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-1 min-h-0 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0 h-14">
          <TabsTrigger value="borrows">My Borrows</TabsTrigger>
          <TabsTrigger value="lending">My Lending</TabsTrigger>
        </TabsList>

        <TabsContent
          value="borrows"
          className="space-y-6 overflow-y-auto flex-1"
        >
          {isLoansLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading your loans...</p>
            </Card>
          ) : (
            <>
              {borrowLoansForUI.some((b) => b.healthFactor < 1.3) && (
                <LiquidationAlert
                  loans={borrowLoansForUI.filter((b) => b.healthFactor < 1.3)}
                />
              )}

              {borrowLoansForUI.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No active loans</p>
                  <Button onClick={() => void navigate("/marketplace")}>
                    Browse Offers
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {borrowLoansForUI.map((loan) => (
                    <Card
                      key={loan.id}
                      className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => void navigate(`/position/${loan.id}`)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Loan ID
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            #{loan.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Borrowed
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            ${loan.principalUSDC.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Collateral
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            {(loan.collateralXLM / 1000).toFixed(0)}k XLM
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Interest Accrued
                          </p>
                          <p className="font-mono font-semibold text-warning">
                            ${loan.accumulatedInterestUSDC.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Health
                          </p>
                          <Badge className={getHealthColor(loan.healthFactor)}>
                            {getHealthStatus(loan.healthFactor)} (
                            {loan.healthFactor.toFixed(2)})
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Repay
                        </Button>
                        <Button variant="outline" size="sm">
                          Add Collateral
                        </Button>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent
          value="lending"
          className="space-y-6 overflow-y-auto flex-1"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Your Lending Offers & Active Loans
            </h3>
            <Button onClick={() => void navigate("/create-offer")}>
              Create New Offer
            </Button>
          </div>

          {isOffersLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading your offers...</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {offers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">
                    Active Offers
                  </h4>
                  {offers
                    .filter((offer) => offer && offer.offer_id !== undefined)
                    .map((offer) => {
                      const availableAmount = offer.usdc_amount || BigInt(0);
                      const weeklyRate =
                        (offer.weekly_interest_rate || 0) / 100;

                      return (
                        <Card
                          key={offer.offer_id.toString()}
                          className="p-6 hover:border-primary/50 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Pool Size
                              </p>
                              <p className="font-mono font-semibold text-foreground">
                                {formatUsdc(offer.usdc_amount || BigInt(0))}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Available
                              </p>
                              <p className="font-mono font-semibold text-foreground">
                                {formatUsdc(availableAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Min Collateral
                              </p>
                              <p className="font-mono font-semibold text-foreground">
                                {(offer.min_collateral_ratio || 0) / 100}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Rate
                              </p>
                              <p className="font-mono font-semibold text-foreground">
                                {weeklyRate}% / week
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Created
                              </p>
                              <p className="font-mono text-sm text-muted-foreground">
                                {new Date(
                                  Number(offer.created_at || BigInt(0)) * 1000,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWithdrawClick(offer.offer_id.toString());
                              }}
                            >
                              Withdraw Available
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelClick(offer.offer_id.toString());
                              }}
                            >
                              Cancel Offer
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from Offer</DialogTitle>
            <DialogDescription>
              Enter the amount of USDC you want to withdraw from your lending
              offer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdrawSubmit}
              disabled={!withdrawAmount || withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Offer Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this lending offer? All remaining
              USDC will be returned to your wallet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              No, Keep Offer
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={cancelOfferMutation.isPending}
            >
              {cancelOfferMutation.isPending
                ? "Cancelling..."
                : "Yes, Cancel Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
