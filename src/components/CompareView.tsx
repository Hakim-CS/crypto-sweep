
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompareViewProps {
  crypto1: CryptoData | null;
  crypto2: CryptoData | null;
  onClearComparison: () => void;
}

export default function CompareView({
  crypto1,
  crypto2,
  onClearComparison,
}: CompareViewProps) {
  if (!crypto1 || !crypto2) return null;

  const calculateDifference = (value1: number, value2: number) => {
    return ((value1 - value2) / value2) * 100;
  };

  const calculateMetricGrowth = (percentage: number | undefined) => {
    if (!percentage) return "N/A";
    return percentage > 0 ? `+${percentage.toFixed(2)}%` : `${percentage.toFixed(2)}%`;
  };

  const metrics = [
    {
      label: "Current Price",
      value1: `$${crypto1.current_price.toLocaleString()}`,
      value2: `$${crypto2.current_price.toLocaleString()}`,
      difference: calculateDifference(crypto1.current_price, crypto2.current_price),
    },
    {
      label: "Market Cap",
      value1: `$${crypto1.market_cap.toLocaleString()}`,
      value2: `$${crypto2.market_cap.toLocaleString()}`,
      difference: calculateDifference(crypto1.market_cap, crypto2.market_cap),
    },
    {
      label: "24h Volume",
      value1: `$${crypto1.total_volume.toLocaleString()}`,
      value2: `$${crypto2.total_volume.toLocaleString()}`,
      difference: calculateDifference(crypto1.total_volume, crypto2.total_volume),
    },
    {
      label: "24h Change",
      value1: calculateMetricGrowth(crypto1.price_change_percentage_24h),
      value2: calculateMetricGrowth(crypto2.price_change_percentage_24h),
      difference: crypto1.price_change_percentage_24h - crypto2.price_change_percentage_24h,
    },
    {
      label: "7d Change",
      value1: calculateMetricGrowth(crypto1.price_change_percentage_7d),
      value2: calculateMetricGrowth(crypto2.price_change_percentage_7d),
      difference: (crypto1.price_change_percentage_7d || 0) - (crypto2.price_change_percentage_7d || 0),
    },
    {
      label: "30d Change",
      value1: calculateMetricGrowth(crypto1.price_change_percentage_30d),
      value2: calculateMetricGrowth(crypto2.price_change_percentage_30d),
      difference: (crypto1.price_change_percentage_30d || 0) - (crypto2.price_change_percentage_30d || 0),
    },
  ];

  const getPerformanceInsight = () => {
    const price24hDiff = crypto1.price_change_percentage_24h - crypto2.price_change_percentage_24h;
    const marketCapDiff = calculateDifference(crypto1.market_cap, crypto2.market_cap);
    
    if (price24hDiff > 0 && marketCapDiff > 0) {
      return `${crypto1.name} is outperforming ${crypto2.name} in both price action and market cap`;
    } else if (price24hDiff < 0 && marketCapDiff < 0) {
      return `${crypto2.name} is outperforming ${crypto1.name} in both price action and market cap`;
    } else {
      return `Mixed performance: ${crypto1.name} and ${crypto2.name} show different strengths`;
    }
  };

  return (
    <div className="w-full space-y-6 slide-in">
      <Card className="glass">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Comparison Analysis</CardTitle>
              <CardDescription>Detailed metrics comparison</CardDescription>
            </div>
            <button
              onClick={onClearComparison}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CryptoCard crypto={crypto1} className="!cursor-default" />
            <CryptoCard crypto={crypto2} className="!cursor-default" />
          </div>
          
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Performance Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {getPerformanceInsight()}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-sm font-medium">{metric.value1}</span>
                <span className="text-sm font-medium">{metric.value2}</span>
                <span className={`text-sm font-medium ${
                  metric.difference > 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {metric.difference.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
