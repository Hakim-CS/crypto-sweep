
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";

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

  return (
    <div className="w-full glass rounded-lg p-6 mt-8 slide-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Comparison</h2>
        <button
          onClick={onClearComparison}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CryptoCard crypto={crypto1} className="!cursor-default" />
        <CryptoCard crypto={crypto2} className="!cursor-default" />
      </div>
      <div className="mt-6 space-y-4">
        <ComparisonRow
          label="Price Difference"
          value={calculateDifference(crypto1.current_price, crypto2.current_price)}
          format="percent"
        />
        <ComparisonRow
          label="Market Cap Difference"
          value={calculateDifference(crypto1.market_cap, crypto2.market_cap)}
          format="percent"
        />
        <ComparisonRow
          label="24h Volume Difference"
          value={calculateDifference(crypto1.total_volume, crypto2.total_volume)}
          format="percent"
        />
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  value: number;
  format: "percent" | "number";
}

function ComparisonRow({ label, value, format }: ComparisonRowProps) {
  const formattedValue = format === "percent" ? `${value.toFixed(2)}%` : value.toLocaleString();
  const isPositive = value > 0;

  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {formattedValue}
      </span>
    </div>
  );
}
