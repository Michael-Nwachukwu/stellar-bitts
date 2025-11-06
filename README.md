# Stellar Bits - P2P Lending Protocol

<div align="center">

![Stellar Bits Banner](public/assets/pc_blueprint.gif)

**A decentralized peer-to-peer lending platform built on Stellar blockchain using Scaffold Stellar**

[![Built with Stellar](https://img.shields.io/badge/Built%20with-Stellar-blue)](https://stellar.org)
[![Scaffold Stellar](https://img.shields.io/badge/Scaffold-Stellar-purple)](https://github.com/AhaLabs/scaffold-stellar)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-green)](https://soroban.stellar.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

[Live Demo](#) | [Documentation](#) | [Report Bug](#) | [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [How We Leveraged Scaffold Stellar](#how-we-leveraged-scaffold-stellar)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
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

Built entirely on Stellar blockchain using Soroban smart contracts, Stellar Bits demonstrates the power of decentralized finance with instant settlements, low fees, and transparent on-chain lending.

### Why Stellar Bits?

Traditional lending platforms are centralized, opaque, and often have high barriers to entry. Stellar Bits solves this by:

✅ **Decentralized** - No intermediaries, smart contracts handle everything
✅ **Transparent** - All transactions and terms on-chain
✅ **Instant** - Stellar's 5-second finality
✅ **Low Cost** - Minimal transaction fees
✅ **Global** - Accessible to anyone with a Stellar wallet
✅ **Flexible** - Customizable lending terms and rates

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

### 3. **Environment Management** 🌍

Scaffold's `environments.toml` and `.env` configuration made multi-network deployment seamless:

```toml
# environments.toml - Scaffold Stellar configuration
[testnet]
network_passphrase = "Test SDF Network ; September 2015"
rpc_url = "https://soroban-testnet.stellar.org"
horizon_url = "https://horizon-testnet.stellar.org"

[mainnet]
network_passphrase = "Public Global Stellar Network ; September 2015"
rpc_url = "https://soroban.stellar.org"
horizon_url = "https://horizon.stellar.org"
```

**Benefits:**

- ✅ Easy testnet ↔ mainnet switching
- ✅ Environment-specific contract addresses
- ✅ Consistent configuration across team

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
- Mock Oracle: `CA25SV6J6LJS3GYZS6F6I5DH4DJBJGWQXDYTLWFZBZW3F2TJE3P5IV5I`
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

### Mock Oracle Contract

**Price feed for XLM/USD conversion**

```rust
fn get_price() -> i128  // Returns XLM price in 7 decimals
```

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

## 💻 Usage

### For Lenders

1. **Connect Wallet** - Click "Connect" and approve Freighter
2. **Create Offer** - Navigate to "Create Offer"
   - Set lending amount (USDC)
   - Choose weekly interest rate
   - Set minimum collateral ratio
   - Define liquidation threshold
   - Set max loan duration
3. **Approve & Create** - Approve USDC spending, then create offer
4. **Manage Offers** - View in Dashboard → My Lending tab
   - Withdraw available funds
   - Cancel offers

### For Borrowers

1. **Browse Marketplace** - View all active lending offers
2. **Select Offer** - Choose based on rate, amount, and terms
3. **Enter Details**:
   - XLM collateral amount
   - USDC borrow amount (up to max borrowable)
4. **Approve & Borrow** - Approve XLM collateral and execute
5. **Manage Position** - View in Dashboard → My Borrows
   - Monitor health factor
   - Add collateral
   - Repay debt
   - Withdraw excess collateral

---

## 🔗 Stellar SDK Integration

### Contract Client Generation

Scaffold Stellar automatically generates TypeScript clients:

```typescript
// Auto-generated from contracts/lending_market/src/lib.rs
import lendingMarket from "@/contracts/lending_market";

// Full type safety and IntelliSense
const result = await lendingMarket.create_offer({
  lender: "GXXX...",
  usdc_amount: BigInt(10000 * 1e7),
  weekly_interest_rate: 500, // 5% in basis points
  min_collateral_ratio: 20000,
  liquidation_threshold: 12500,
  max_duration_weeks: 52,
});
```

### Transaction Building

Using Stellar SDK with Scaffold's utilities:

```typescript
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "@/hooks/lending/useContractClients";

const { signTransaction } = useWallet();
const { lendingMarket } = useContractClients();

// Build and sign transaction
const tx = await lendingMarket.borrow({
  borrower: address,
  offer_id: BigInt(1),
  collateral_amount: parseXlm("1000"),
  borrow_amount: parseUsdc("100"),
});

const result = await tx.signAndSend({ signTransaction });
```

### Horizon API Integration

Fetching account balances:

```typescript
import { Horizon } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await horizon.accounts().accountId(address).call();
const xlmBalance = account.balances.find((b) => b.asset_type === "native");
```

### Price Oracle Integration

```typescript
import mockOracle from "@/contracts/mock_oracle";

const { result } = await mockOracle.get_price();
const xlmPrice = Number(result.unwrap()) / 1e7; // Convert from 7 decimals
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

## 🗺 Roadmap

### Phase 1: MVP ✅ (Current)

- [x] Core lending/borrowing functionality
- [x] Health monitoring
- [x] Position management
- [x] Dashboard analytics
- [x] Real-time notifications

### Phase 2: Enhanced Features (Q2 2025)

- [ ] Multi-asset collateral support
- [ ] Flash loans
- [ ] Governance token
- [ ] Liquidation auctions
- [ ] Advanced analytics

### Phase 3: Mainnet (Q3 2025)

- [ ] Security audits
- [ ] Mainnet deployment
- [ ] Insurance fund
- [ ] Cross-chain bridges

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

**Project Maintainer** - [@yourusername](https://twitter.com/yourusername)

**Project Link** - [https://github.com/yourusername/stellar-bits](https://github.com/yourusername/stellar-bits)

**Live Demo** - [https://stellar-bits.vercel.app](https://stellar-bits.vercel.app)

---

<div align="center">

**Built with ❤️ using Scaffold Stellar**

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-brightgreen)](https://stellar.org)
[![Scaffold](https://img.shields.io/badge/Scaffold-Stellar-purple)](https://github.com/AhaLabs/scaffold-stellar)

</div>
