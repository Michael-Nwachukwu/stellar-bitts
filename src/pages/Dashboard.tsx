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

interface LendingOffer {
  id: string;
  amountUSTC: number;
  weeklyRate: number;
  minCollateralRatio: number;
  liquidationThreshold: number;
  maxDurationWeeks: number;
  availableAmount: number;
  borrowedAmount: number;
  accumulatedInterestEarned: number;
  status: "active";
}

const MOCK_BORROWS = [
  {
    id: "5921",
    offerId: "1",
    lenderId: "GBPD...ABC",
    principalUSDC: 5000,
    collateralXLM: 50000,
    weeklyRate: 5,
    startTime: Date.now() - 604800000,
    accumulatedInterestUSDC: 250,
    healthFactor: 1.8,
    status: "active" as const,
  },
  {
    id: "5922",
    lenderId: "GABC...XYZ",
    principalUSDC: 10000,
    collateralXLM: 75000,
    weeklyRate: 3.5,
    startTime: Date.now() - 1209600000,
    accumulatedInterestUSDC: 700,
    healthFactor: 1.2,
    status: "active" as const,
  },
];

const MOCK_OFFERS: LendingOffer[] = [
  {
    id: "offer_1",
    amountUSTC: 10000,
    weeklyRate: 5,
    minCollateralRatio: 200,
    liquidationThreshold: 125,
    maxDurationWeeks: 52,
    availableAmount: 8000,
    borrowedAmount: 2000,
    accumulatedInterestEarned: 450,
    status: "active" as const,
  },
  {
    id: "offer_2",
    amountUSTC: 50000,
    weeklyRate: 3.5,
    minCollateralRatio: 250,
    liquidationThreshold: 125,
    maxDurationWeeks: 26,
    availableAmount: 25000,
    borrowedAmount: 25000,
    accumulatedInterestEarned: 1850,
    status: "active" as const,
  },
];

const MOCK_LENDING_LOANS = [
  {
    id: "5921",
    borrowerId: "GXYZ...DEF",
    amountLentUSDC: 2000,
    accumulatedInterestEarned: 250,
    status: "active" as const,
  },
  {
    id: "5922",
    borrowerId: "GAAA...BBB",
    amountLentUSDC: 25000,
    accumulatedInterestEarned: 1850,
    status: "active" as const,
  },
];

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

  const totalBorrowed = MOCK_BORROWS.reduce(
    (sum, b) => sum + b.principalUSDC,
    0,
  );
  const totalBorrowedInterest = MOCK_BORROWS.reduce(
    (sum, b) => sum + b.accumulatedInterestUSDC,
    0,
  );
  const totalLent = MOCK_OFFERS.reduce((sum, o) => sum + o.borrowedAmount, 0);
  const totalEarnedInterest = MOCK_OFFERS.reduce(
    (sum, o) => sum + o.accumulatedInterestEarned,
    0,
  );
  const netPosition = totalEarnedInterest - totalBorrowedInterest;

  const dashboardStats = [
    {
      label: "Total Borrowed",
      value: `$${totalBorrowed.toLocaleString()}`,
      description: `+$${totalBorrowedInterest.toFixed(2)} interest accrued`,
      icon: GearIcon,
      tag: "ACTIVE",
      intent: "negative" as const,
      direction: "down" as const,
    },
    {
      label: "Total Lent",
      value: `$${totalLent.toLocaleString()}`,
      description: `+$${totalEarnedInterest.toFixed(2)} earned`,
      icon: ProcessorIcon,
      tag: "EARNING",
      intent: "positive" as const,
      direction: "up" as const,
    },
    {
      label: "Net Position",
      value: `$${netPosition.toFixed(2)}`,
      description: "Profit/Loss",
      icon: BoomIcon,
      tag: netPosition >= 0 ? "PROFIT" : "LOSS",
      intent: netPosition >= 0 ? "positive" : "negative",
    },
  ];

  const getHealthColor = (health: number) => {
    if (health > 1.5) return "bg-success/10 text-success";
    if (health > 1.25) return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };
  const getHealthStatus = (health: number) => {
    if (health > 1.5) return "Safe";
    if (health > 1.25) return "Caution";
    return "At Risk";
  };

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
            {MOCK_BORROWS.some((b) => b.healthFactor < 1.3) && (
              <LiquidationAlert
                loans={MOCK_BORROWS.filter((b) => b.healthFactor < 1.3)}
              />
            )}

            {MOCK_BORROWS.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No active loans</p>
                <Button onClick={() => void navigate("/marketplace")}>
                  Browse Offers
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {MOCK_BORROWS.map((loan) => (
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

            <div className="space-y-6">
              {MOCK_OFFERS.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">
                    Active Offers
                  </h4>
                  {MOCK_OFFERS.map((offer) => (
                    <Card
                      key={offer.id}
                      className="p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Pool Size
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            ${offer.amountUSTC.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Available
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            ${offer.availableAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Lent Out
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            ${offer.borrowedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Rate
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            {offer.weeklyRate}% / week
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Interest Earned
                          </p>
                          <p className="font-mono font-semibold text-success">
                            ${offer.accumulatedInterestEarned.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit Terms
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw Available
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel Offer
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {MOCK_LENDING_LOANS.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">
                    Loans from Your Offers
                  </h4>
                  {MOCK_LENDING_LOANS.map((loanRecord) => (
                    <Card
                      key={loanRecord.id}
                      className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Loan ID
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            #{loanRecord.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Borrower
                          </p>
                          <p className="text-sm font-mono text-muted-foreground">
                            {loanRecord.borrowerId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Amount Lent
                          </p>
                          <p className="font-mono font-semibold text-foreground">
                            ${loanRecord.amountLentUSDC.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Interest Earned
                          </p>
                          <p className="font-mono font-semibold text-success">
                            ${loanRecord.accumulatedInterestEarned.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
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
