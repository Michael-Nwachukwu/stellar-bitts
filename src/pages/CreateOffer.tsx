import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { GearIcon } from "@/components/icons/gear";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateOffer } from "@/hooks/lending";
import { useNavigate } from "react-router-dom";

interface OfferFormData {
  amountUSTC: string;
  weeklyRate: number;
  minCollateralRatio: number;
  liquidationThreshold: number;
  maxDurationWeeks: number;
}

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OfferFormData>({
    amountUSTC: "",
    weeklyRate: 5,
    minCollateralRatio: 200,
    liquidationThreshold: 125,
    maxDurationWeeks: 52,
  });
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "yearly">(
    "monthly",
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOfferId, setCreatedOfferId] = useState<string>("");

  // Use the real mutation hook
  const createOfferMutation = useCreateOffer();

  const amount = Number.parseFloat(formData.amountUSTC) || 0;
  const weeklyReturn = (amount * formData.weeklyRate) / 100;
  // const monthlyReturn = weeklyReturn * 4.33;
  // const yearlyReturn = weeklyReturn * 52;
  const calculateAPY = () => (formData.weeklyRate * 52).toFixed(2);

  return (
    <DashboardPageLayout
      header={{
        title: "Create Lending Offer",
        description: "Set your lending terms and expected returns",
        icon: GearIcon,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="amount"
                  className="text-base font-semibold mb-2 block"
                >
                  Amount to Lend (USDC)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10,000"
                    value={formData.amountUSTC}
                    onChange={(e) =>
                      setFormData({ ...formData, amountUSTC: e.target.value })
                    }
                    className="bg-muted text-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({ ...formData, amountUSTC: "100000" })
                    }
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: 500,000 USDC
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">
                    Weekly Interest Rate
                  </Label>
                  <Badge
                    className={
                      formData.weeklyRate < 5
                        ? "bg-success/20 text-success"
                        : formData.weeklyRate < 15
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                    }
                  >
                    {formData.weeklyRate}% / week
                  </Badge>
                </div>
                <Slider
                  value={[formData.weeklyRate]}
                  onValueChange={([v]) =>
                    setFormData({
                      ...formData,
                      weeklyRate: Number.parseFloat(v.toFixed(1)),
                    })
                  }
                  min={0.1}
                  max={30}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0.1%</span>
                  <span>APY: {calculateAPY()}%</span>
                  <span>30%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">
                    Min Collateral Ratio
                  </Label>
                  <span className="text-primary font-mono">
                    {formData.minCollateralRatio}%
                  </span>
                </div>
                <Slider
                  value={[formData.minCollateralRatio]}
                  onValueChange={([v]) =>
                    setFormData({ ...formData, minCollateralRatio: v })
                  }
                  min={150}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Borrowers must provide XLM collateral worth this % of the loan
                  amount
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-semibold">
                    Liquidation Threshold
                  </Label>
                  <span className="text-primary font-mono">
                    {formData.liquidationThreshold}%
                  </span>
                </div>
                <Slider
                  value={[formData.liquidationThreshold]}
                  onValueChange={([v]) =>
                    setFormData({ ...formData, liquidationThreshold: v })
                  }
                  min={110}
                  max={150}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Collateral will be liquidated if ratio falls below this
                  threshold
                </p>
              </div>

              <div>
                <Label
                  htmlFor="duration"
                  className="text-base font-semibold mb-2 block"
                >
                  Max Loan Duration (Weeks)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.maxDurationWeeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDurationWeeks: Math.max(
                        1,
                        Math.min(52, Number.parseInt(e.target.value) || 1),
                      ),
                    })
                  }
                  className="bg-muted"
                />
              </div>

              <Button
                onClick={() => {
                  void (async () => {
                    try {
                      const offerId = await createOfferMutation.mutateAsync({
                        usdcAmount: formData.amountUSTC,
                        weeklyRate: formData.weeklyRate,
                        minCollateralRatio: formData.minCollateralRatio,
                        liquidationThreshold: formData.liquidationThreshold,
                        maxDurationWeeks: formData.maxDurationWeeks,
                      });
                      setCreatedOfferId(offerId.toString());
                      setShowSuccessModal(true);
                    } catch (error) {
                      console.error("Failed to create offer:", error);
                      // Could add error toast here
                    }
                  })();
                }}
                disabled={createOfferMutation.isPending || !formData.amountUSTC}
                size="lg"
                className="w-full"
              >
                {createOfferMutation.isPending
                  ? "Approving & Creating..."
                  : "Approve & Create Offer"}
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-header-mobile lg:top-0 bg-linear-to-b from-primary/5 to-transparent border-primary/20">
            <h3 className="font-semibold text-foreground mb-4">
              Offer Preview
            </h3>
            <div className="space-y-4 mb-6">
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Lend Amount
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {amount > 0
                    ? amount.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : "0"}{" "}
                  USDC
                </p>
              </div>
              <div className="bg-card rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Annual Percentage Yield
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {calculateAPY()}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold block">
                Estimated Returns
              </Label>
              <Tabs
                value={activeTab}
                onValueChange={(v) =>
                  setActiveTab(v as "daily" | "monthly" | "yearly")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Daily Return
                  </p>
                  <p className="text-xl font-semibold text-success">
                    {(weeklyReturn / 7).toFixed(2)} USDC
                  </p>
                </TabsContent>
                <TabsContent value="monthly" className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Monthly Return
                  </p>
                  <p className="text-xl font-semibold text-success">
                    {(weeklyReturn * 4.33).toFixed(2)} USDC
                  </p>
                </TabsContent>
                <TabsContent value="yearly" className="bg-card rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Yearly Return
                  </p>
                  <p className="text-xl font-semibold text-success">
                    {(weeklyReturn * 52).toFixed(2)} USDC
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="text-foreground font-mono">
                  {formData.weeklyRate}% / week
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Collateral</span>
                <span className="text-foreground font-mono">
                  {formData.minCollateralRatio}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidation</span>
                <span className="text-foreground font-mono">
                  {formData.liquidationThreshold}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Duration</span>
                <span className="text-foreground font-mono">
                  {formData.maxDurationWeeks}w
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Offer Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Offer ID</p>
              <p className="text-2xl font-mono font-semibold text-success">
                {`# ${createdOfferId}`}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>Amount</span>
                <span className="font-mono">
                  {amount.toLocaleString()} USDC
                </span>
              </div>
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>Rate</span>
                <span className="font-mono">{formData.weeklyRate}% / week</span>
              </div>
              <div className="flex justify-between bg-card p-3 rounded-lg">
                <span>APY</span>
                <span className="font-mono">{calculateAPY()}%</span>
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  setShowSuccessModal(false);
                  void navigate("/dashboard");
                }}
              >
                View in Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form
                  setFormData({
                    amountUSTC: "",
                    weeklyRate: 5,
                    minCollateralRatio: 200,
                    liquidationThreshold: 125,
                    maxDurationWeeks: 52,
                  });
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageLayout>
  );
}
