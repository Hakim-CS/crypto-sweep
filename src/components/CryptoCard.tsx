
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CryptoData } from "@/lib/types";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface CryptoCardProps {
  crypto: CryptoData;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

export default function CryptoCard({ 
  crypto, 
  onClick, 
  className = "", 
  selected = false
}: CryptoCardProps) {
  const isPositive = crypto.price_change_percentage_24h > 0;

  return (
    <Card
      className={`p-4 hover:scale-[1.02] transition-all duration-200 glass ${
        selected ? "ring-2 ring-primary" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
          <div>
            <h3 className="font-semibold">{crypto.name}</h3>
            <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="font-semibold">${crypto.current_price.toLocaleString()}</p>
        <p
          className={`text-sm flex items-center ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </p>
      </div>
    </Card>
  );
}
