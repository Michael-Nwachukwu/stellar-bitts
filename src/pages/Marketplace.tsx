import { useState, useMemo } from "react";
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
import { useActiveOffersWithData } from "@/hooks/lending";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<MarketplaceFiltersType>({
    sort: "best-rate",
    view: "grid",
  });

  // Fetch real offers from contract with full data
  const { data: activeOffers = [], isLoading } = useActiveOffersWithData();

  // Convert contract offers to UI format
  const allOffers: LendingOffer[] = useMemo(() => {
    return activeOffers
      .filter((offer) => offer && offer.offer_id !== undefined)
      .map((offer) => ({
        id: offer.offer_id.toString(),
        lenderId: offer.lender,
        amountUSTC: offer.usdc_amount || BigInt(0),
        weeklyRate: (offer.weekly_interest_rate || 0) / 100,
        minCollateralRatio: (offer.min_collateral_ratio || 0) / 100,
        liquidationThreshold: (offer.liquidation_threshold || 0) / 100,
        maxDurationWeeks: offer.max_duration_weeks || 0,
        availableAmount: offer.usdc_amount || BigInt(0),
        createdAt: Number(offer.created_at || BigInt(0)) * 1000,
        status: "active" as const,
      }));
  }, [activeOffers]);

  // Apply filters and sorting
  const filteredOffers = useMemo(() => {
    let filtered = [...allOffers];

    // Apply filters
    if (filters.minAmount) {
      filtered = filtered.filter(
        (o) => o.availableAmount >= filters.minAmount!,
      );
    }
    if (filters.maxRate) {
      filtered = filtered.filter((o) => o.weeklyRate <= filters.maxRate!);
    }
    if (filters.maxDuration) {
      filtered = filtered.filter(
        (o) => o.maxDurationWeeks <= filters.maxDuration!,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
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

    return filtered;
  }, [allOffers, filters]);

  const handleFilterChange = (newFilters: MarketplaceFiltersType) => {
    setFilters(newFilters);
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
          ) : filteredOffers.length === 0 ? (
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
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} view={filters.view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
