"use client";

import * as React from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bullet } from "@/components/ui/bullet";
import type { TimePeriod } from "@/types/dashboard";
import {
  useUserLoansAsBorrowerWithData,
  useUserOffersWithData,
} from "@/hooks/lending";

type ChartDataPoint = {
  date: string;
  borrowed: number;
  lent: number;
  interest: number;
};

const chartConfig = {
  borrowed: {
    label: "Borrowed",
    color: "hsl(var(--primary))",
  },
  lent: {
    label: "Lent Out",
    color: "hsl(217, 91%, 60%)", // Lighter blue variant
  },
  interest: {
    label: "Interest",
    color: "hsl(217, 91%, 75%)", // Even lighter blue
  },
} satisfies ChartConfig;

export default function DashboardChart() {
  const [activeTab, setActiveTab] = React.useState<TimePeriod>("week");
  const { data: borrowerLoans = [] } = useUserLoansAsBorrowerWithData();
  const { data: offers = [] } = useUserOffersWithData();

  const handleTabChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      setActiveTab(value as TimePeriod);
    }
  };

  // Generate chart data based on real positions
  const generateChartData = React.useMemo(() => {
    const totalBorrowed = borrowerLoans.reduce((sum, loan) => {
      return sum + Number(loan.borrowed_amount || BigInt(0)) / 1e7;
    }, 0);

    const totalInterest = borrowerLoans.reduce((sum, loan) => {
      return sum + Number(loan.accumulated_interest || BigInt(0)) / 1e7;
    }, 0);

    const totalLent = offers.reduce((sum, offer) => {
      return sum + Number(offer.usdc_amount || BigInt(0)) / 1e7;
    }, 0);

    // Generate time-series data (simulated growth since we don't have historical data)
    const generateTimeSeries = (
      periods: number,
      label: (i: number) => string,
    ) => {
      const data: ChartDataPoint[] = [];

      for (let i = 0; i < periods; i++) {
        const progress = i / (periods - 1); // 0 to 1
        data.push({
          date: label(i),
          borrowed: Math.round(totalBorrowed * progress),
          lent: Math.round(totalLent * progress),
          interest: Math.round(totalInterest * progress),
        });
      }

      return data;
    };

    return {
      week: generateTimeSeries(7, (i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString("en-US", { weekday: "short" });
      }),
      month: generateTimeSeries(30, (i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return i % 5 === 0
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "";
      }),
      year: generateTimeSeries(12, (i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return date.toLocaleDateString("en-US", { month: "short" });
      }),
    };
  }, [borrowerLoans, offers]);

  const formatYAxisValue = (value: number) => {
    // Hide the "0" value by returning empty string
    if (value === 0) {
      return "";
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const renderChart = (data: ChartDataPoint[]) => {
    return (
      <div className="bg-accent rounded-lg p-3">
        <ChartContainer className="md:aspect-3/1 w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillBorrowed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-borrowed)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-borrowed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-lent)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-lent)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInterest" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-interest)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-interest)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="8 8"
              strokeWidth={2}
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              strokeWidth={1.5}
              className="uppercase text-sm fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickCount={6}
              className="text-sm fill-muted-foreground"
              tickFormatter={formatYAxisValue}
              domain={[0, "dataMax"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="min-w-[200px] px-4 py-3"
                />
              }
            />
            <Area
              dataKey="borrowed"
              type="linear"
              fill="url(#fillBorrowed)"
              fillOpacity={0.4}
              stroke="var(--color-borrowed)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="lent"
              type="linear"
              fill="url(#fillLent)"
              fillOpacity={0.4}
              stroke="var(--color-lent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="interest"
              type="linear"
              fill="url(#fillInterest)"
              fillOpacity={0.4}
              stroke="var(--color-interest)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="max-md:gap-4"
    >
      <div className="flex items-center justify-between mb-4 max-md:contents">
        <TabsList className="max-md:w-full">
          <TabsTrigger value="week">WEEK</TabsTrigger>
          <TabsTrigger value="month">MONTH</TabsTrigger>
          <TabsTrigger value="year">YEAR</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-6 max-md:order-1">
          {Object.entries(chartConfig).map(([key, value]) => (
            <ChartLegend key={key} label={value.label} color={value.color} />
          ))}
        </div>
      </div>
      <TabsContent value="week" className="space-y-4">
        {renderChart(generateChartData.week)}
      </TabsContent>
      <TabsContent value="month" className="space-y-4">
        {renderChart(generateChartData.month)}
      </TabsContent>
      <TabsContent value="year" className="space-y-4">
        {renderChart(generateChartData.year)}
      </TabsContent>
    </Tabs>
  );
}

export const ChartLegend = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => {
  return (
    <div className="flex items-center gap-2 uppercase">
      <Bullet style={{ backgroundColor: color }} className="rotate-45" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};
