import React, { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import type {
  LendingOffer,
  MarketplaceFilters as MarketplaceFiltersType,
} from "@/types/lending";
import FiltersComponent from "@/components/marketplace/filters";
import OfferCard from "@/components/marketplace/offer-card";
import { LoadingSkeleton } from "@/components/utility/loading-skeleton";
import { EmptyState } from "@/components/utility/empty-state";
import { LayoutGridIcon, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_OFFERS: LendingOffer[] = [
  {
    id: "1",
    lenderId: "GBPD...ABC",
    amountUSTC: BigInt("10000000000"),
    weeklyRate: 5,
    minCollateralRatio: 200,
    liquidationThreshold: 125,
    maxDurationWeeks: 52,
    availableAmount: BigInt("10000000000"),
    createdAt: Date.now() - 86400000,
    status: "active",
  },
  {
    id: "2",
    lenderId: "GABC...XYZ",
    amountUSTC: BigInt("50000000000"),
    weeklyRate: 3.5,
    minCollateralRatio: 250,
    liquidationThreshold: 125,
    maxDurationWeeks: 26,
    availableAmount: BigInt("25000000000"),
    createdAt: Date.now() - 172800000,
    status: "active",
  },
  {
    id: "3",
    lenderId: "GXYZ...DEF",
    amountUSTC: BigInt("100000000000"),
    weeklyRate: 8,
    minCollateralRatio: 200,
    liquidationThreshold: 125,
    maxDurationWeeks: 12,
    availableAmount: BigInt("50000000000"),
    createdAt: Date.now() - 259200000,
    status: "active",
  },
];

export default function MarketplacePage() {
  const [offers, setOffers] = useState<LendingOffer[]>(MOCK_OFFERS);
  const [filters, setFilters] = useState<MarketplaceFiltersType>({
    sort: "best-rate",
    view: "grid",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (newFilters: MarketplaceFiltersType) => {
    setFilters(newFilters);
    setIsLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_OFFERS];
      if (newFilters.minAmount) {
        filtered = filtered.filter(
          (o) => o.availableAmount >= newFilters.minAmount!,
        );
      }
      if (newFilters.maxRate) {
        filtered = filtered.filter((o) => o.weeklyRate <= newFilters.maxRate!);
      }
      if (newFilters.maxDuration) {
        filtered = filtered.filter(
          (o) => o.maxDurationWeeks <= newFilters.maxDuration!,
        );
      }
      filtered.sort((a, b) => {
        switch (newFilters.sort) {
          case "best-rate":
            return a.weeklyRate - b.weeklyRate;
          case "highest-amount":
            return Number(b.availableAmount - a.availableAmount);
          case "newest":
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      });
      setOffers(filtered);
      setIsLoading(false);
    }, 300);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Marketplace",
        description: "Browse available lending offers",
        icon: BracketsIcon,
      }}
    >
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="lg:w-64">
          <FiltersComponent
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-end gap-2 mb-6">
            <Button
              variant={filters.view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ ...filters, view: "grid" })}
              className="w-10 h-10 p-0"
            >
              <LayoutGridIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={filters.view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ ...filters, view: "list" })}
              className="w-10 h-10 p-0"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div
              className={
                filters.view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "space-y-4"
              }
            >
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} height="h-48" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No offers found"
              message="Try adjusting your filters to find available lending offers"
            />
          ) : (
            <div
              className={
                filters.view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "space-y-4"
              }
            >
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} view={filters.view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
