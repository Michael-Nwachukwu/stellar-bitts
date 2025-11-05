import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import BracketsIcon from "@/components/icons/brackets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LiquidationAlert } from "@/components/lending/alerts/liquidation-alert";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import { Card } from "@/components/ui/card";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import DashboardChart from "@/components/dashboard/chart";
import { useNavigate } from "react-router-dom";
import {
  useDashboardStats,
  useUserLoansAsBorrowerWithData,
  useUserOffersWithData,
  useActiveOffersWithData,
} from "@/hooks/lending";
import {
  formatUsdc,
  getHealthColor,
  getHealthStatus,
} from "@/lib/lending-utils";
import {
  useCancelOffer,
  useWithdrawFromOffer,
} from "@/hooks/lending/mutations";
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
import { useMemo } from "react";

export default function LendingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("borrows");

  // Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Fetch real data from hooks
  const { data: dashboardData } = useDashboardStats();
  const { data: borrowerLoans = [], isLoading: isLoansLoading } =
    useUserLoansAsBorrowerWithData();
  const { data: offers = [], isLoading: isOffersLoading } =
    useUserOffersWithData();
  const { data: marketplaceOffers = [] } = useActiveOffersWithData();

  // Mutations
  const cancelOfferMutation = useCancelOffer();
  const withdrawMutation = useWithdrawFromOffer();

  // Handlers for offer actions
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

  // Dashboard stats from real data
  const dashboardStats = [
    {
      label: "Total Borrowed",
      value: dashboardData?.totalBorrowed || "$0",
      description: `+${dashboardData?.totalBorrowedInterest || "$0"} interest accrued`,
      icon: GearIcon,
      tag: "ACTIVE",
      intent: "negative" as const,
      direction: "down" as const,
    },
    {
      label: "Total Lent",
      value: dashboardData?.totalLent || "$0",
      description: `+${dashboardData?.totalEarnedInterest || "$0"} earned`,
      icon: ProcessorIcon,
      tag: "EARNING",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "Net Position",
      value: dashboardData?.netPosition || "$0",
      description: "Profit/Loss",
      icon: BoomIcon,
      tag: dashboardData?.isProfit ? "PROFIT" : "LOSS",
      intent: dashboardData?.isProfit ? "positive" : "negative",
    },
  ];

  // Calculate aggregated security status from user's loans
  const portfolioHealth = useMemo(() => {
    if (borrowerLoans.length === 0) {
      return [
        {
          title: "Portfolio Status",
          value: "N/A",
          status: "No Active Loans",
          variant: "success" as const,
        },
        {
          title: "Active Positions",
          value: "0",
          status: "Start Borrowing",
          variant: "success" as const,
        },
        {
          title: "Total Exposure",
          value: "$0",
          status: "Safe",
          variant: "success" as const,
        },
      ];
    }

    // Calculate total borrowed and collateral
    const totalBorrowed = borrowerLoans.reduce((sum, loan) => {
      return sum + Number(loan.borrowed_amount || BigInt(0)) / 1e7;
    }, 0);

    const totalCollateralXLM = borrowerLoans.reduce((sum, loan) => {
      return sum + Number(loan.collateral_amount || BigInt(0)) / 1e7;
    }, 0);

    // Simple health estimation based on collateral to debt ratio
    // Assuming XLM price around $0.10-0.15 for rough calculation
    const estimatedCollateralValue = totalCollateralXLM * 0.12; // Rough estimate
    const healthRatio =
      totalBorrowed > 0 ? estimatedCollateralValue / totalBorrowed : 0;

    let statusValue = "Healthy";
    let statusLabel = "All Positions Safe";
    let statusVariant: "success" | "warning" | "destructive" = "success";

    if (healthRatio < 1.2 && healthRatio > 0) {
      statusValue = "At Risk";
      statusLabel = "Monitor Closely";
      statusVariant = "destructive";
    } else if (healthRatio < 1.5 && healthRatio > 0) {
      statusValue = "Moderate";
      statusLabel = "Consider Adding Collateral";
      statusVariant = "warning";
    }

    return [
      {
        title: "Portfolio Status",
        value: statusValue,
        status: statusLabel,
        variant: statusVariant,
      },
      {
        title: "Active Positions",
        value: borrowerLoans.length.toString(),
        status: `${borrowerLoans.length} Active Loan${borrowerLoans.length !== 1 ? "s" : ""}`,
        variant: "success" as const,
      },
      {
        title: "Total Borrowed",
        value: `$${totalBorrowed.toFixed(0)}`,
        status: `${totalCollateralXLM.toFixed(0)} XLM Locked`,
        variant: "success" as const,
      },
    ];
  }, [borrowerLoans]);

  // Convert borrower loans to format expected by UI
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

  return (
    <DashboardPageLayout
      header={{
        title: "Dashboard",
        description: "Manage your lending and borrowing positions",
        icon: BracketsIcon,
      }}
    >
      <div className="flex flex-col min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 shrink-0">
          {dashboardStats.map((stat) => (
            <DashboardStat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              tag={stat.tag}
              intent={
                stat.intent as "negative" | "positive" | "neutral" | undefined
              }
              direction={stat.direction}
            />
          ))}
        </div>

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
                    <p className="text-muted-foreground mb-4">
                      No active loans
                    </p>
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
                            <Badge
                              className={getHealthColor(loan.healthFactor)}
                            >
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
                                    Number(offer.created_at || BigInt(0)) *
                                      1000,
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
                                  handleWithdrawClick(
                                    offer.offer_id.toString(),
                                  );
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
                Are you sure you want to cancel this lending offer? All
                remaining USDC will be returned to your wallet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 shrink-0 mt-6">
          <RebelsRanking
            rebels={marketplaceOffers
              .slice(0, 4)
              .filter((offer) => offer && offer.offer_id !== undefined)
              .map((offer, index) => {
                const availableUSDC =
                  Number(offer.usdc_amount || BigInt(0)) / 1e7;
                const weeklyRate = (offer.weekly_interest_rate || 0) / 100;
                return {
                  id: offer.offer_id.toString(),
                  name: `${(availableUSDC / 1000).toFixed(1)}k USDC`,
                  handle: `${weeklyRate}% weekly`,
                  avatar: "/stellar-usdc-offer.jpg",
                  points: Number(offer.usdc_amount || BigInt(0)) / 1e7,
                  subtitle: `${(offer.min_collateral_ratio || 0) / 100}% collateral`,
                  featured: index === 0,
                };
              })}
          />
          <SecurityStatus statuses={portfolioHealth} />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
