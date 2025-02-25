
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CryptoData } from "@/lib/types";
import { ArrowUpIcon, ArrowDownIcon, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface CryptoCardProps {
  crypto: CryptoData;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  showWatchlistButton?: boolean;
}

export default function CryptoCard({ 
  crypto, 
  onClick, 
  className = "", 
  selected = false,
  showWatchlistButton = true
}: CryptoCardProps) {
  const { toast } = useToast();
  const isPositive = crypto.price_change_percentage_24h > 0;
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const portfolio = JSON.parse(localStorage.getItem("portfolio") || '{"assets":[], "watchlist":[]}');
    return portfolio.watchlist.map((item: { cryptoId: string }) => item.cryptoId);
  });

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const portfolio = JSON.parse(localStorage.getItem("portfolio") || '{"assets":[], "watchlist":[]}');
    
    if (watchlist.includes(crypto.id)) {
      portfolio.watchlist = portfolio.watchlist.filter(
        (item: { cryptoId: string }) => item.cryptoId !== crypto.id
      );
      setWatchlist(watchlist.filter(id => id !== crypto.id));
      toast({
        title: "Removed from Watchlist",
        description: `${crypto.name} has been removed from your watchlist`,
      });
    } else {
      portfolio.watchlist.push({ cryptoId: crypto.id });
      setWatchlist([...watchlist, crypto.id]);
      toast({
        title: "Added to Watchlist",
        description: `${crypto.name} has been added to your watchlist`,
      });
    }

    localStorage.setItem("portfolio", JSON.stringify(portfolio));
  };

  return (
    <Card
      className={`p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 glass ${
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
        {showWatchlistButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToWatchlist}
            className="ml-2"
          >
            <Star
              className={`h-4 w-4 ${
                watchlist.includes(crypto.id) ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        )}
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
