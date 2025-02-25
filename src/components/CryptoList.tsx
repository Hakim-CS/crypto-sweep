
import { CryptoCard } from "./CryptoCard";
import { CryptoData } from "@/lib/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto: (crypto: CryptoData) => void;
  selectedCryptos: [CryptoData | null, CryptoData | null];
}

export default function CryptoList({
  cryptos,
  onSelectCrypto,
  selectedCryptos,
}: CryptoListProps) {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const portfolio = JSON.parse(localStorage.getItem("portfolio") || '{"assets":[], "watchlist":[]}');
    return portfolio.watchlist.map((item: { cryptoId: string }) => item.cryptoId);
  });

  const handleAddToWatchlist = (crypto: CryptoData) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cryptos.map((crypto) => (
        <div key={crypto.id} className="relative">
          <CryptoCard
            crypto={crypto}
            onClick={() => onSelectCrypto(crypto)}
            selected={selectedCryptos.some((selected) => selected?.id === crypto.id)}
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleAddToWatchlist(crypto)}
          >
            <Star
              className={`h-4 w-4 ${
                watchlist.includes(crypto.id) ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        </div>
      ))}
    </div>
  );
}
