/**
 * Lending Platform Utility Functions
 * Format, parse, and calculate values for the P2P lending platform
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const USDC_DECIMALS = 7;
export const XLM_DECIMALS = 7;
export const SECONDS_PER_WEEK = 604800;
export const BASIS_POINTS = 10000;

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format USDC amount from smallest unit to human-readable string
 * @param amount - Amount in smallest unit (stroops, 7 decimals)
 * @returns Formatted string like "1,234.56"
 */
export function formatUsdc(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  const value = num / Math.pow(10, USDC_DECIMALS);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format XLM amount from smallest unit to human-readable string
 * @param amount - Amount in smallest unit (stroops, 7 decimals)
 * @returns Formatted string like "1,234.56"
 */
export function formatXlm(amount: bigint | number): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  const value = num / Math.pow(10, XLM_DECIMALS);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

/**
 * Format percentage from basis points (e.g., 500 = 5.00%)
 * @param basisPoints - Value in basis points (10000 = 100%)
 * @returns Formatted string like "5.00%"
 */
export function formatPercentage(basisPoints: number): string {
  const percent = basisPoints / 100;
  return `${percent.toFixed(2)}%`;
}

/**
 * Format interest rate for display
 * @param weeklyRate - Weekly interest rate in basis points (500 = 5%)
 * @returns Formatted string like "5.0% weekly"
 */
export function formatInterestRate(weeklyRate: number): string {
  const percent = weeklyRate / 100;
  return `${percent.toFixed(1)}% weekly`;
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse USDC amount from human-readable string to smallest unit
 * @param amount - Amount as string like "1234.56"
 * @returns Amount in smallest unit (stroops)
 */
export function parseUsdc(amount: string): bigint {
  const num = parseFloat(amount);
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, USDC_DECIMALS)));
}

/**
 * Parse XLM amount from human-readable string to smallest unit
 * @param amount - Amount as string like "1234.56"
 * @returns Amount in smallest unit (stroops)
 */
export function parseXlm(amount: string): bigint {
  const num = parseFloat(amount);
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, XLM_DECIMALS)));
}

/**
 * Parse percentage to basis points (e.g., "5.5%" -> 550)
 * @param percentage - Percentage as number (5.5 for 5.5%)
 * @returns Basis points (550)
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.floor(percentage * 100);
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate health factor from collateral value and debt
 * Health Factor = (Collateral Value / Debt) / Liquidation Threshold
 * @param collateralValue - Value of collateral in USDC (smallest unit)
 * @param totalDebt - Total debt including interest in USDC (smallest unit)
 * @param liquidationThreshold - Threshold in basis points (e.g., 12500 = 125%)
 * @returns Health factor as a number (1.5 = 150%)
 */
export function calculateHealthFactor(
  collateralValue: bigint,
  totalDebt: bigint,
  liquidationThreshold: number,
): number {
  if (totalDebt === 0n) return Infinity;

  const collateralNum = Number(collateralValue);
  const debtNum = Number(totalDebt);
  const thresholdDecimal = liquidationThreshold / BASIS_POINTS;

  return collateralNum / (debtNum * thresholdDecimal);
}

/**
 * Calculate collateralization ratio
 * Ratio = (Collateral Value / Debt) * 100
 * @param collateralValue - Value of collateral in USDC (smallest unit)
 * @param totalDebt - Total debt including interest in USDC (smallest unit)
 * @returns Ratio as percentage (200 = 200%)
 */
export function calculateCollateralizationRatio(
  collateralValue: bigint,
  totalDebt: bigint,
): number {
  if (totalDebt === 0n) return Infinity;

  const collateralNum = Number(collateralValue);
  const debtNum = Number(totalDebt);

  return (collateralNum / debtNum) * 100;
}

/**
 * Calculate liquidation price for XLM
 * Price at which the loan becomes liquidatable
 * @param totalDebt - Total debt in USDC (smallest unit)
 * @param collateralAmount - XLM collateral amount (smallest unit)
 * @param liquidationThreshold - Threshold in basis points (12500 = 125%)
 * @returns Liquidation price in USDC per XLM
 */
export function calculateLiquidationPrice(
  totalDebt: bigint,
  collateralAmount: bigint,
  liquidationThreshold: number,
): number {
  if (collateralAmount === 0n) return 0;

  const debtNum = Number(totalDebt);
  const collateralNum = Number(collateralAmount);
  const thresholdDecimal = liquidationThreshold / BASIS_POINTS;

  // Liquidation happens when: collateral_value = debt * threshold
  // So: xlm_amount * price = debt * threshold
  // Therefore: price = (debt * threshold) / xlm_amount
  const liquidationValue = debtNum * thresholdDecimal;
  return liquidationValue / collateralNum;
}

/**
 * Calculate APY from weekly interest rate
 * APY = weekly_rate * 52 weeks
 * @param weeklyRate - Weekly rate in basis points (500 = 5%)
 * @returns APY as percentage (260 = 260%)
 */
export function calculateApy(weeklyRate: number): number {
  return (weeklyRate / 100) * 52;
}

/**
 * Calculate simple interest for a loan
 * Interest = Principal * Rate * (Elapsed Time / Week)
 * @param principal - Principal amount in USDC (smallest unit)
 * @param weeklyRate - Weekly interest rate in basis points (500 = 5%)
 * @param startTime - Loan start timestamp (seconds)
 * @param currentTime - Current timestamp (seconds)
 * @returns Interest amount in USDC (smallest unit)
 */
export function calculateInterest(
  principal: bigint,
  weeklyRate: number,
  startTime: number,
  currentTime: number = Date.now() / 1000,
): bigint {
  const elapsedSeconds = currentTime - startTime;
  if (elapsedSeconds <= 0) return 0n;

  const principalNum = Number(principal);
  const rateDecimal = weeklyRate / BASIS_POINTS;
  const timeRatio = elapsedSeconds / SECONDS_PER_WEEK;

  const interest = principalNum * rateDecimal * timeRatio;
  return BigInt(Math.floor(interest));
}

/**
 * Calculate total debt (principal + accumulated interest)
 * @param principal - Principal amount in USDC (smallest unit)
 * @param accumulatedInterest - Previously accumulated interest
 * @param weeklyRate - Weekly interest rate in basis points
 * @param lastUpdate - Last interest update timestamp
 * @param currentTime - Current timestamp (seconds)
 * @returns Total debt in USDC (smallest unit)
 */
export function calculateTotalDebt(
  principal: bigint,
  accumulatedInterest: bigint,
  weeklyRate: number,
  lastUpdate: number,
  currentTime: number = Date.now() / 1000,
): bigint {
  const newInterest = calculateInterest(
    principal,
    weeklyRate,
    lastUpdate,
    currentTime,
  );
  return principal + accumulatedInterest + newInterest;
}

/**
 * Calculate distance to liquidation in USDC
 * @param collateralValue - Collateral value in USDC (smallest unit)
 * @param totalDebt - Total debt in USDC (smallest unit)
 * @param liquidationThreshold - Threshold in basis points (12500 = 125%)
 * @returns Distance in USDC (smallest unit), negative means underwater
 */
export function calculateLiquidationDistance(
  collateralValue: bigint,
  totalDebt: bigint,
  liquidationThreshold: number,
): bigint {
  const thresholdDecimal = liquidationThreshold / BASIS_POINTS;
  const requiredCollateral = Number(totalDebt) * thresholdDecimal;
  return BigInt(Math.floor(Number(collateralValue) - requiredCollateral));
}

// ============================================================================
// HEALTH STATUS HELPERS
// ============================================================================

export type HealthStatus = "safe" | "caution" | "danger";

/**
 * Get health status from health factor
 * @param healthFactor - Health factor as number
 * @returns Status: 'safe' (>1.5), 'caution' (1.25-1.5), 'danger' (<1.25)
 */
export function getHealthStatus(healthFactor: number): HealthStatus {
  if (healthFactor > 1.5) return "safe";
  if (healthFactor > 1.25) return "caution";
  return "danger";
}

/**
 * Get health color for UI
 * @param healthFactor - Health factor as number
 * @returns Tailwind color class
 */
export function getHealthColor(healthFactor: number): string {
  const status = getHealthStatus(healthFactor);
  switch (status) {
    case "safe":
      return "text-green-500";
    case "caution":
      return "text-yellow-500";
    case "danger":
      return "text-red-500";
  }
}

/**
 * Get health background color for UI
 * @param healthFactor - Health factor as number
 * @returns Tailwind background class
 */
export function getHealthBgColor(healthFactor: number): string {
  const status = getHealthStatus(healthFactor);
  switch (status) {
    case "safe":
      return "bg-green-500/10";
    case "caution":
      return "bg-yellow-500/10";
    case "danger":
      return "bg-red-500/10";
  }
}

// ============================================================================
// TIME HELPERS
// ============================================================================

/**
 * Format timestamp to relative time (e.g., "2 days ago")
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

/**
 * Format duration in seconds to human readable (e.g., "2 weeks 3 days")
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const weeks = Math.floor(seconds / 604800);
  const days = Math.floor((seconds % 604800) / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (weeks > 0) {
    return days > 0 ? `${weeks}w ${days}d` : `${weeks}w`;
  }
  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  return `${hours}h`;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if an amount is valid (positive and non-zero)
 * @param amount - Amount to check
 * @returns true if valid
 */
export function isValidAmount(amount: bigint | string): boolean {
  if (typeof amount === "string") {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }
  return amount > 0n;
}

/**
 * Check if interest rate is within valid range (0.1% - 30% weekly)
 * @param weeklyRate - Weekly rate in basis points
 * @returns true if valid
 */
export function isValidInterestRate(weeklyRate: number): boolean {
  return weeklyRate >= 10 && weeklyRate <= 3000; // 0.1% to 30%
}

/**
 * Check if collateral ratio is valid (>= 150%)
 * @param ratio - Ratio in basis points (15000 = 150%)
 * @returns true if valid
 */
export function isValidCollateralRatio(ratio: number): boolean {
  return ratio >= 15000; // >= 150%
}
