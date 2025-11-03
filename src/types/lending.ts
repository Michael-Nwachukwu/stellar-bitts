// Core lending platform types for Stellar P2P lending

export interface LendingOffer {
  id: string;
  lenderId: string;
  amountUSTC: bigint; // Amount in USDC (smallest unit)
  weeklyRate: number; // 0.1 - 30%
  minCollateralRatio: number; // 150% - 300%
  liquidationThreshold: number; // 110% - 150%
  maxDurationWeeks: number;
  availableAmount: bigint;
  createdAt: number;
  expiresAt?: number;
  status: "active" | "fulfilled" | "cancelled" | "expired";
}

export interface Loan {
  id: string;
  offerId: string;
  lenderId: string;
  borrowerId: string;
  principalUSTC: bigint;
  collateralXLM: bigint;
  weeklyRate: number;
  startTime: number;
  durationWeeks: number;
  repaidAmount: bigint;
  collateralWithdrawn: bigint;
  status: "active" | "repaid" | "liquidated";
  lastInterestUpdate: number;
}

export interface UserPosition {
  borrowing: Loan[];
  lending: LendingOffer[];
  lendingLoans: Loan[]; // Loans created from user's offers
}

export interface PriceData {
  xlmUsdcPrice: bigint; // Price in smallest USDC unit
  timestamp: number;
  oracleSource: "reflector";
}

export interface HealthMetrics {
  collateralValueUSDC: bigint;
  totalDebtUSDC: bigint;
  healthFactor: number; // collateralValue / (debt * liquidationThreshold)
  collateralizationRatio: number; // collateralValue / debt
  liquidationPrice: number; // XLM price that triggers liquidation
  liquidationDistance: bigint; // Distance in USDC terms
}

export type SortOption = "best-rate" | "highest-amount" | "newest";
export type ViewMode = "grid" | "list";

export interface MarketplaceFilters {
  minAmount?: bigint;
  maxRate?: number;
  maxDuration?: number;
  sort: SortOption;
  view: ViewMode;
}
