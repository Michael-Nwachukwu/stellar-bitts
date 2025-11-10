# Stellar Bits - P2P Lending Protocol

<div align="center">

![Stellar Bits Banner](public/assets/pc_blueprint.gif)

**A decentralized peer-to-peer lending platform built on Stellar blockchain using Scaffold Stellar**

[![Built on Stellar](https://img.shields.io/badge/Built%20with-Stellar-blue)](https://stellar.org)
[![Scaffold Stellar](https://img.shields.io/badge/Scaffold-Stellar-purple)](https://github.com/AhaLabs/scaffold-stellar)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-green)](https://soroban.stellar.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

[Live Demo](https://www.loom.com/share/316f182880364902a24d50f62d5dc4be) | [Website](https://stellar-bits.vercel.app/)

</div>

---

## 📋 Table of Contents

- [About The Project](#About-the-project)
- [How It Works](#how-it-works)
- [User Roadmap](#user-roadmap)
- [How We Leveraged Scaffold Stellar](#how-we-leveraged-scaffold-stellar)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Price Oracle Integration](#price-oracle-integration)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Stellar SDK Integration](#stellar-sdk-integration)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 About The Project

**Stellar Bits** is a decentralized peer-to-peer lending protocol that enables users to:

- **Lend USDC** and earn competitive interest rates
- **Borrow USDC** using XLM as collateral
- **Manage positions** with real-time health monitoring
- **Track portfolio** with comprehensive analytics

Built entirely on Stellar blockchain using Stellar scaffold smart contracts, Stellar Bits demonstrates the power of decentralized finance with instant settlements, low fees, and transparent on-chain lending.

### Why Stellar Bits?

Traditional lending platforms are centralized, opaque, and often have high barriers to entry. Stellar Bits solves this by:

✅ **Decentralized** - No intermediaries, smart contracts handle everything
✅ **Transparent** - All transactions and terms on-chain
✅ **Instant** - Stellar's 5-second finality
✅ **Low Cost** - Minimal transaction fees
✅ **Global** - Accessible to anyone with a Stellar wallet
✅ **Flexible** - Customizable lending terms and rates

---

## 🔄 How It Works

### The Stellar Bits Lending Flywheel

```
                        ┌──────────────────────────────┐
                        │   LENDERS DEPOSIT USDC       │
                        │   (Set Interest Rates)       │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │  OFFERS ADDED TO MARKETPLACE │
                        │  (Visible to All Borrowers)  │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │  BORROWERS CHOOSE BEST RATES │
                        │  (Deposit XLM as Collateral) │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │   USDC TRANSFERRED TO LOAN   │
                        │   (Interest Starts Accruing) │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │  ORACLE MONITORS XLM PRICE   │
                        │   (Real-time via Reflector)  │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │   HEALTH FACTOR TRACKED      │
                        │   (Liquidation Protection)   │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │  BORROWER REPAYS + INTEREST  │
                        │   (XLM Collateral Released)  │
                        └──────────────┬───────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │  LENDERS EARN YIELD & REPEAT │
                        │   (Continuous Liquidity ♻️)  │
                        └──────────────────────────────┘
```

### Key Mechanisms

#### 1. **Collateralization** 🔒

- Borrowers deposit XLM worth 200%+ of loan value
- Minimum collateral ratio enforced by smart contract
- Real-time health monitoring prevents undercollateralization

#### 2. **Interest Calculation** 💰

- Per-second simple interest: `Interest = Principal × Rate × Time`
- Automatic accrual on-chain (no cron jobs needed)
- Rates set by lenders (0.1% - 30% weekly)

#### 3. **Price Oracle** 📊

- Live XLM/USD prices from Reflector Network
- 5-minute update frequency
- 14-decimal precision for accurate calculations

#### 4. **Liquidation Mechanism** ⚠️

- Triggered when health factor < 1.0
- Liquidators repay debt, receive collateral at discount
- Protects lenders from bad debt

#### 5. **Position Management** 🎛️

- Add collateral to improve health
- Partial or full debt repayment
- Withdraw excess collateral when safe

---

## 🗺️ User Roadmap

### For Lenders: Earn Passive Income

```
START
  │
  ├─► 1. CONNECT WALLET
  │     └─► Install Freighter
  │         └─► Approve connection
  │
  ├─► 2. FUND WALLET WITH USDC
  │     └─► Bridge from other chains (optional)
  │         └─► Or acquire on Stellar DEX
  │
  ├─► 3. CREATE LENDING OFFER
  │     ├─► Navigate to "Create Offer"
  │     ├─► Set Terms:
  │     │     • Amount: 100 - 1,000,000 USDC
  │     │     • Weekly Rate: 0.1% - 30%
  │     │     • Collateral Ratio: 150% - 300%
  │     │     • Liquidation Threshold: 120% - 150%
  │     │     • Max Duration: 1 - 52 weeks
  │     └─► Approve USDC → Create Offer
  │
  ├─► 4. TRACK IN DASHBOARD
  │     ├─► View active offers
  │     ├─► Monitor loans against offers
  │     ├─► Track total interest earned
  │     └─► See real-time notifications
  │
  ├─► 5. MANAGE POSITIONS
  │     ├─► Withdraw available funds anytime
  │     ├─► Cancel unused offers
  │     └─► View loan health status
  │
  └─► 6. EARN & COMPOUND
        └─► Reinvest profits into new offers
            └─► Build passive income stream 💰
```

### For Borrowers: Access Instant Liquidity

```
START
  │
  ├─► 1. CONNECT WALLET
  │     └─► Install Freighter
  │         └─► Approve connection
  │
  ├─► 2. FUND WALLET WITH XLM
  │     └─► Acquire from exchanges
  │         └─► Or use Stellar DEX
  │
  ├─► 3. BROWSE MARKETPLACE
  │     ├─► Navigate to "Marketplace"
  │     ├─► Filter by:
  │     │     • Interest rate (best first)
  │     │     • Available amount
  │     │     • Loan duration
  │     └─► Compare offers
  │
  ├─► 4. BORROW USDC
  │     ├─► Select best offer
  │     ├─► Enter:
  │     │     • XLM collateral amount
  │     │     • USDC borrow amount
  │     ├─► View real-time calculations:
  │     │     • Max borrowable
  │     │     • Health factor
  │     │     • Liquidation price
  │     └─► Approve XLM → Execute Borrow
  │
  ├─► 5. USE YOUR USDC
  │     └─► Trade, invest, or use as needed
  │         └─► While XLM stays as collateral
  │
  ├─► 6. MONITOR POSITION
  │     ├─► Check health factor daily
  │     ├─► Watch XLM price movements
  │     ├─► Get liquidation warnings
  │     └─► Track accrued interest
  │
  ├─► 7. MANAGE RISK
  │     ├─► Add collateral if health drops
  │     ├─► Repay partial debt
  │     └─► Withdraw excess collateral
  │
  └─► 8. REPAY & CLOSE
        ├─► Repay full debt + interest
        └─► Receive XLM collateral back ✨
```

### Quick Actions Matrix

| Action             | Lender                | Borrower             |
| ------------------ | --------------------- | -------------------- |
| **Create Offer**   | ✅ Set rates & terms  | ❌                   |
| **Borrow**         | ��                    | ✅ From marketplace  |
| **Withdraw**       | ✅ Available funds    | ✅ Excess collateral |
| **Add Collateral** | ❌                    | ✅ Improve health    |
| **Repay**          | ❌                    | ✅ Partial or full   |
| **Cancel Offer**   | ✅ If no active loans | ❌                   |
| **Liquidate**      | ✅ Unhealthy loans    | ❌                   |
| **Track Earnings** | ✅ Dashboard          | ❌                   |
| **Monitor Health** | ❌                    | ✅ Real-time         |

---

## 🚀 How We Leveraged Scaffold Stellar

Scaffold Stellar was **instrumental** in accelerating our development process. Here's how we utilized its features:

### 1. **Smart Contract Auto-Generation** 🔄

Scaffold Stellar's automatic TypeScript client generation from Rust smart contracts saved us weeks of development:

```typescript
// Auto-generated TypeScript client from Soroban contract
import lendingMarket from "@/contracts/lending_market";

// Type-safe contract calls with full IntelliSense
const loan = await lendingMarket.borrow({
  borrower: address,
  offer_id: BigInt(offerId),
  collateral_amount: parseXlm(collateral),
  borrow_amount: parseUsdc(amount),
});
```

**Scaffold Impact:**

- ✅ Zero manual client code writing
- ✅ Full TypeScript type safety
- ✅ Automatic contract updates on rebuild
- ✅ Reduced bugs from manual typing

### 2. **Hot Reload Development** ⚡

The hot reload feature allowed us to iterate rapidly:

```bash
# Changes to Rust contracts automatically update TypeScript clients
npm run dev
```

**Development Speed:**

- 🔥 Contract changes reflect in < 5 seconds
- 🔥 No manual regeneration needed
- 🔥 Frontend stays in sync with contracts

### 4. **Wallet Integration** 💼

Scaffold's pre-configured wallet integration with `@creit.tech/stellar-wallets-kit` enabled:

```typescript
// Scaffold-provided wallet hooks
import { useWallet } from "@/hooks/useWallet";

const { address, signTransaction } = useWallet();

// Seamless transaction signing
await transaction.signAndSend({ signTransaction });
```

**Wallet Features:**

- ✅ Freighter wallet support
- ✅ Hot wallet for development
- ✅ Transaction signing abstraction
- ✅ Network detection

### 5. **Contract Deployment Utilities** 📦

Scaffold's integration with Stellar CLI simplified deployment:

```bash
# Scaffold makes deployment straightforward
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/lending_market.wasm \
  --network testnet
```

**Deployed Contracts:**

- Lending Market: `CALZAKWIDYX4COYTCRYU3PQXO4RV6ZSJRWBQLCF5CENRD2QSWQD52XX6`
- Mock USDC: `CDLMEZPLZ7R625QZMXZFGK4IU2GSF25MC44E4QWTABNXCONF3B3ZNIBN`

---

## ✨ Key Features

### For Lenders 💰

- **Create Lending Offers** - Set your own interest rates, collateral requirements, and loan duration
- **Automated Interest** - Smart contracts calculate and accrue interest automatically
- **Withdraw Anytime** - Pull available funds from your offers without canceling
- **Portfolio Tracking** - Real-time dashboard with earnings and active loans

### For Borrowers 🏦

- **Browse Marketplace** - Find the best lending offers with competitive rates
- **Flexible Terms** - Choose offers that match your needs
- **Health Monitoring** - Real-time health factor with liquidation warnings
- **Position Management** - Add collateral, repay debt, or withdraw excess collateral

### Platform Features 🎨

- **Real-time Notifications** - Contract event-based alerts for all activities
- **Dynamic Location & Time** - Auto-detects user's timezone and location
- **Interactive Charts** - Visualize lending/borrowing activity over time
- **Security Status** - Aggregated portfolio health monitoring
- **Token Balances** - Live XLM and USDC balance display

---

## 🛠 Tech Stack

### Frontend

| Technology         | Version | Purpose                 |
| ------------------ | ------- | ----------------------- |
| **React**          | 18.3    | UI Framework            |
| **TypeScript**     | 5.9     | Type Safety             |
| **Vite**           | 7.1     | Build Tool              |
| **TanStack Query** | 5.x     | Data Fetching & Caching |
| **Tailwind CSS**   | 4.1     | Styling                 |
| **Framer Motion**  | 11.x    | Animations              |
| **React Router**   | 7.x     | Routing                 |

### Blockchain

| Tool                 | Version | Purpose                |
| -------------------- | ------- | ---------------------- |
| **Stellar SDK**      | Latest  | Blockchain Interaction |
| **Soroban**          | Latest  | Smart Contracts        |
| **Stellar CLI**      | Latest  | Contract Deployment    |
| **Scaffold Stellar** | Latest  | Development Framework  |

### Smart Contracts (Rust)

| Crate              | Version | Purpose              |
| ------------------ | ------- | -------------------- |
| **soroban-sdk**    | 22.0    | Contract Development |
| **stellar-strkey** | Latest  | Address Encoding     |

### Additional Tools

- **Stellar Wallets Kit** - Multi-wallet support
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit linting

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──��───────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │  Marketplace │  │   Position   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
          ┌────────────────────────────────────┐
          │  Auto-Generated TypeScript Clients │
          │    (Scaffold Stellar Magic ✨)     │
          └────────────────────────────────────┘
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              Stellar Blockchain (Testnet)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lending    │  │  Mock USDC   │  │ Mock Oracle  │      │
│  │    Market    │  │   Contract   │  │   Contract   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → React Component
2. **Component** → TanStack Query Hook
3. **Hook** → Auto-generated Contract Client
4. **Client** → Stellar SDK Transaction
5. **Transaction** → Soroban Smart Contract
6. **Contract** → Blockchain State Update
7. **Event Emission** → Frontend Notification
8. **Cache Invalidation** → UI Update

---

## 📜 Smart Contracts

### Lending Market Contract

**Main contract handling all lending/borrowing logic**

**Key Functions:**

```rust
// Create a lending offer
fn create_offer(
    lender: Address,
    usdc_amount: i128,
    weekly_interest_rate: u32,
    min_collateral_ratio: u32,
    liquidation_threshold: u32,
    max_duration_weeks: u32,
) -> u64

// Borrow against an offer
fn borrow(
    borrower: Address,
    offer_id: u64,
    collateral_amount: i128,
    borrow_amount: i128,
) -> u64

// Repay a loan
fn repay(
    borrower: Address,
    loan_id: u64,
    repay_amount: i128,
)

// Add collateral to loan
fn add_collateral(
    borrower: Address,
    loan_id: u64,
    additional_collateral: i128,
)

// Liquidate undercollateralized loan
fn liquidate(
    liquidator: Address,
    loan_id: u64,
)
```

**State Management:**

- Offers indexed by ID
- Loans indexed by ID
- User mappings for quick lookups
- Real-time interest calculation

### Mock USDC Contract

**ERC-20 compatible token for testing**

```rust
fn balance(id: Address) -> i128
fn transfer(from: Address, to: Address, amount: i128)
fn approve(from: Address, spender: Address, amount: i128, expiration_ledger: u32)
```

---

## 📊 Price Oracle Integration

Stellar Bits uses **Reflector Network** oracles for real-time XLM/USD price feeds on testnet and mainnet.

### Reflector Network Integration

**Testnet Oracle Addresses:**

| Oracle Type            | Contract Address                                           | Purpose                                      |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| **CEX/DEX Oracle**     | `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63` | External market prices (XLM, BTC, ETH, etc.) |
| **Stellar DEX Oracle** | `CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP` | On-chain Stellar DEX prices                  |

**Current Configuration:**

- Using **CEX/DEX Oracle** for native XLM price feeds
- Asset type: `Asset::Other("XLM")`
- Price decimals: **14** (Reflector standard)
- Update frequency: **Every 5 minutes**
- Current XLM price: ~**$0.27** USD

### Implementation

#### Contract Integration

```rust
// contracts/lending_market/src/oracle.rs
use crate::reflector::{Asset as ReflectorAsset, PriceData, ReflectorClient};

pub fn get_xlm_price(env: &Env, oracle_address: &Address) -> Result<PriceData, Error> {
    let client = ReflectorClient::new(env, oracle_address);

    // XLM as symbol (works with CEX/DEX oracle)
    let xlm_asset = ReflectorAsset::Other(soroban_sdk::symbol_short!("XLM"));

    // Fetch latest price
    let price_data = client
        .lastprice(&xlm_asset)
        .ok_or(Error::PriceNotAvailable)?;

    // Validate price is not stale (5 min threshold)
    let current_time = env.ledger().timestamp();
    if current_time - price_data.timestamp > 300 {
        return Err(Error::StalePriceData);
    }

    // Sanity check: XLM between $0.01 and $100
    let decimals = client.decimals(); // 14 decimals
    let min_price = 10_i128.pow(decimals - 2);
    let max_price = 100 * 10_i128.pow(decimals);

    if price_data.price < min_price || price_data.price > max_price {
        return Err(Error::InvalidPriceData);
    }

    Ok(price_data)
}
```

#### Frontend Integration

```typescript
// src/hooks/lending/queries/useXlmPrice.ts
import lendingMarket from "@/contracts/lending_market";

export function useXlmPrice() {
  return useQuery({
    queryKey: ["xlm-price"],
    queryFn: async () => {
      const priceResult = await lendingMarket.get_xlm_price();
      return priceResult.result.unwrap();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Convert from 14 decimals to display format
export function formatXlmPrice(price: bigint): number {
  return Number(price) / 1e14;
}
```

### Price Validation

The oracle integration includes multiple safety checks:

1. **Staleness Check** - Rejects prices older than 5 minutes
2. **Range Validation** - Ensures XLM price is within reasonable bounds ($0.01 - $100)
3. **Positive Value** - Prevents negative prices
4. **Decimal Precision** - Handles 14-decimal Reflector format correctly

### Updating Oracle Address

The oracle address can be updated by the contract admin without redeployment:

```bash
stellar contract invoke \
  --id <LENDING_MARKET_ID> \
  --source-account admin \
  --network testnet \
  -- \
  set-oracle-address \
  --admin <ADMIN_ADDRESS> \
  --oracle CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63
```

### Available Assets on Reflector Testnet

The CEX/DEX oracle provides prices for:

- **XLM** - Stellar Lumens
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **USDT** - Tether
- **SOL** - Solana
- **USDC** - USD Coin
- **ADA** - Cardano
- **AVAX** - Avalanche
- **DOT** - Polkadot
- **MATIC** - Polygon
- **LINK** - Chainlink
- **DAI** - Dai Stablecoin
- **ATOM** - Cosmos
- **UNI** - Uniswap
- **EURC** - Euro Coin

### Benefits of Reflector Integration

✅ **Decentralized** - No single point of failure
✅ **Real-time** - Updates every 5 minutes
✅ **Accurate** - Volume-weighted average from multiple sources
✅ **Reliable** - Maintained by trusted Stellar ecosystem organizations
✅ **SEP-40 Compatible** - Standard interface across all Stellar oracles
✅ **Historical Data** - 24-hour price history available
✅ **Free** - No fees for using public price feeds

### Future Enhancements

- [ ] TWAP (Time-Weighted Average Price) for liquidations
- [ ] Multi-oracle aggregation for redundancy
- [ ] Custom asset price feeds
- [ ] Circuit breaker for extreme price movements

---

## 🚀 Getting Started

### Prerequisites

Ensure you have all requirements from [Soroban Setup Guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup):

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Soroban target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli

# Install Scaffold Stellar plugin
stellar install scaffold
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/stellar-bits.git
cd stellar-bits
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env

# Edit .env to set network (LOCAL, TESTNET, or MAINNET)
PUBLIC_STELLAR_NETWORK="TESTNET"
PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
```

4. **Build contracts** (if modifying)

```bash
stellar contract build
```

5. **Start development server**

```bash
npm run dev
```

6. **Open browser**

```
http://localhost:5173
```

### Deployment to Testnet

```bash
# Deploy contracts
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/lending_market.wasm \
  --network testnet \
  --source alice

# Initialize contracts
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- initialize \
  --oracle <ORACLE_ADDRESS> \
  --usdc <USDC_ADDRESS>
```

---

## 📁 Project Structure

```
stellar-bits/
├── contracts/                        # Soroban Smart Contracts (Rust)
│   ├── lending_market/              # Main lending contract
│   │   ├── src/
│   │   │   ├── lib.rs              # Contract logic
│   │   │   ├── storage.rs          # State management
│   │   │   └── types.rs            # Data structures
│   │   └── Cargo.toml
│   ├── mock_oracle/                 # Price oracle mock
│   └── mock_usdc/                   # USDC token mock
│
├── packages/                         # Auto-generated by Scaffold Stellar
│   └── lending_market/              # TypeScript contract clients
│
├── src/
│   ├── components/                   # React Components
│   │   ├── dashboard/               # Dashboard widgets
│   │   │   ├── chart/              # Lending/borrowing charts
│   │   │   ├── notifications/      # Real-time notifications
│   │   │   ├── rebels-ranking/     # Top offers display
│   │   │   ├── security-status/    # Portfolio health
│   │   │   └── widget/             # Location/time widget
│   │   ├── lending/                 # Lending-specific components
│   │   │   ├── alerts/             # Liquidation alerts
│   │   │   └── forms/              # Input forms
│   │   ├── marketplace/             # Marketplace components
│   │   │   ├── filters.tsx         # Offer filtering
│   │   │   └── offer-card.tsx      # Offer display card
│   │   └── ui/                      # shadcn/ui components
│   │
│   ├── contracts/                    # Contract interaction layer
│   │   ├── lending_market.ts        # Auto-generated client
│   │   ├── mock_oracle.ts           # Oracle client
│   │   ├── mock_usdc.ts             # USDC client
│   │   └── util.ts                  # Network utilities
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── lending/
│   │   │   ├── mutations/           # Write operations
│   │   │   │   ├── useBorrow.ts    # Borrow hook
│   │   │   │   ├── useRepay.ts     # Repay hook
│   │   │   │   ├── useCreateOffer.ts
│   │   │   │   ├── useAddCollateral.ts
│   │   │   │   └── useLiquidate.ts
│   │   │   ├── queries/             # Read operations
│   │   │   │   ├── useOffer.ts     # Fetch single offer
│   │   │   │   ├── useLoan.ts      # Fetch single loan
│   │   │   │   ├── useXlmPrice.ts  # Fetch XLM price
│   │   │   │   ├── useNotifications.ts
│   │   │   │   └── useDashboardStats.ts
│   │   │   └── useContractClients.ts
│   │   ├── useWallet.ts             # Wallet connection
│   │   └── useTokenBalances.ts      # Token balance fetching
│   │
│   ├── pages/                        # App Pages
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Marketplace.tsx          # Browse offers
│   │   ├── Borrow.tsx               # Borrow flow
│   │   ├── CreateOffer.tsx          # Create offer flow
│   │   └── Position.tsx             # Manage position
│   │
│   ├── lib/                          # Utilities
│   │   └── lending-utils.ts         # Conversion helpers
│   │
│   └── types/                        # TypeScript types
│       ├── lending.ts               # Lending types
│       └── dashboard.ts             # Dashboard types
│
├── .env                              # Environment variables
├── environments.toml                 # Scaffold Stellar config
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── vite.config.ts                   # Vite config
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

Special thanks to:

- **[Stellar Development Foundation](https://stellar.org)** - For building an amazing blockchain
- **[Scaffold Stellar](https://github.com/AhaLabs/scaffold-stellar)** - For the incredible development framework that made this project possible
- **[Soroban Team](https://soroban.stellar.org)** - For the powerful smart contract platform
- **Stellar Community** - For continuous support and feedback

---

## 📞 Contact

**Project Maintainer** - [@0xchef\_\_](https://x.com/0xchef__)

**Project Link** - [https://github.com/yourusername/stellar-bitts](https://github.com/yourusername/stellar-bitts)

**Live Demo** - [https://stellar-bits.vercel.app](https://stellar-bits.vercel.app)

---

<div align="center">

**Built with ❤️ using Scaffold Stellar**

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-brightgreen)](https://stellar.org)
[![Scaffold](https://img.shields.io/badge/Scaffold-Stellar-purple)](https://github.com/AhaLabs/scaffold-stellar)

</div>
