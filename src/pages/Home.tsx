import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MonkeyIcon from "@/components/icons/monkey";
import BracketsIcon from "@/components/icons/brackets";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-accent/20 backdrop-blur-sm z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonkeyIcon className="size-8" />
            <span className="text-2xl font-display">stellar-bits</span>
          </div>
          <Link to="/dashboard">
            <Button variant="default">Enter Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-6 pb-20 text-center min-h-screen">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <span className="size-2 rounded-full bg-accent"></span>
              <span className="text-sm text-muted-foreground">
                Decentralized Lending on Stellar
              </span>
            </div>

            <p className="text-5xl md:text-7xl font-display font-bold leading-tight">
              Peer-to-Peer Lending
              <br />
              <span className="text-accent">On Stellar Blockchain</span>
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lend USDC at competitive rates, borrow with XLM collateral, and
              earn passive income. Real-time pricing, automated liquidations,
              and per-second interest accrual.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/dashboard">
                <Button size="lg" className="px-8">
                  <BracketsIcon className="mr-2 size-5" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 bg-transparent"
                >
                  Browse Offers
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-accent/5 border-t border-accent/20 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Platform Features
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-background border border-accent/20">
                <div className="size-12 rounded bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-xl">💰</span>
                </div>
                <h3 className="font-display text-xl mb-2">Competitive Rates</h3>
                <p className="text-muted-foreground">
                  Lend USDC at rates from 0.1% to 30% weekly
                </p>
              </div>

              <div className="p-6 rounded-lg bg-background border border-accent/20">
                <div className="size-12 rounded bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-xl">🔒</span>
                </div>
                <h3 className="font-display text-xl mb-2">Secure Collateral</h3>
                <p className="text-muted-foreground">
                  XLM collateral with 50% LTV and real-time pricing
                </p>
              </div>

              <div className="p-6 rounded-lg bg-background border border-accent/20">
                <div className="size-12 rounded bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="font-display text-xl mb-2">
                  Real-Time Calculations
                </h3>
                <p className="text-muted-foreground">
                  Per-second interest accrual and auto-liquidations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-accent/20 py-8 px-6 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © 2025 stellar-bits. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Built on Stellar Blockchain
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
