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
} from "@/hooks/lending";
import {
  formatUsdc,
  getHealthColor,
  getHealthStatus,
} from "@/lib/lending-utils";

const TOP_MARKETPLACE_OFFERS = [
  {
    id: "1",
    amountUSDC: 10000,
    weeklyRate: 5,
    riskLevel: "low",
    featured: true,
    points: 1200,
    borrowers: 24,
  },
  {
    id: "2",
    amountUSDC: 25000,
    weeklyRate: 3.5,
    riskLevel: "low",
    featured: false,
    points: 950,
    borrowers: 18,
  },
  {
    id: "3",
    amountUSDC: 50000,
    weeklyRate: 4.2,
    riskLevel: "medium",
    featured: false,
    points: 850,
    borrowers: 15,
  },
];

const PORTFOLIO_HEALTH = [
  {
    title: "Health Score",
    value: "8.5/10",
    status: "Excellent",
    variant: "success" as const,
  },
  {
    title: "Utilization",
    value: "65%",
    status: "Optimal",
    variant: "success" as const,
  },
  {
    title: "Liquidation Risk",
    value: "Low",
    status: "Safe",
    variant: "success" as const,
  },
];

export default function LendingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("borrows");

  // Fetch real data from hooks
  const { data: dashboardData } = useDashboardStats();
  const { data: borrowerLoans = [], isLoading: isLoansLoading } =
    useUserLoansAsBorrowerWithData();
  const { data: offers = [], isLoading: isOffersLoading } =
    useUserOffersWithData();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 flex-shrink-0">
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
          <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0">
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
                              <Button variant="outline" size="sm">
                                Withdraw Available
                              </Button>
                              <Button variant="outline" size="sm">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 shrink-0 mt-6">
          <RebelsRanking
            rebels={TOP_MARKETPLACE_OFFERS.map((offer) => ({
              id: offer.id,
              name: `${offer.amountUSDC / 1000}k USDC`,
              handle: `@${offer.weeklyRate}% weekly`,
              avatar: "/stellar-usdc-offer.jpg",
              points: offer.borrowers,
              subtitle:
                offer.riskLevel === "low"
                  ? "Low Risk Pool"
                  : "Medium Risk Pool",
              featured: offer.featured,
            }))}
          />
          <SecurityStatus statuses={PORTFOLIO_HEALTH} />
        </div>
      </div>
    </DashboardPageLayout>
  );
}
