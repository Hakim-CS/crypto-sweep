
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoData } from "@/lib/types";
import { Star, ArrowUpIcon, ArrowDownIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface WatchlistCardProps {
  watchlist: Array<{ cryptoId: string }>;
  cryptos: CryptoData[];
  onUpdateWatchlist: (newWatchlist: Array<{ cryptoId: string }>) => void;
}

export default function WatchlistCard({ watchlist, cryptos, onUpdateWatchlist }: WatchlistCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRemoveFromWatchlist = (cryptoId: string) => {
    const newWatchlist = watchlist.filter(item => item.cryptoId !== cryptoId);
    onUpdateWatchlist(newWatchlist);
    
    toast({
      title: "Removed from Watchlist",
      description: `${cryptos.find(c => c.id === cryptoId)?.name} has been removed from your watchlist`,
    });
  };

  // Get the actual crypto objects from the watchlist IDs
  const watchlistItems = watchlist
    .map(item => {
      const crypto = cryptos.find(c => c.id === item.cryptoId);
      return crypto ? { ...item, crypto } : null;
    })
    .filter(item => item !== null) as Array<{ cryptoId: string; crypto: CryptoData }>;

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Watchlist</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/")}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watchlistItems.length > 0 ? (
            watchlistItems.map(item => {
              const { crypto } = item;
              
              return (
                <div key={crypto.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                    <div>
                      <h3 className="font-semibold">{crypto.name}</h3>
                      <p className="text-sm text-muted-foreground">${crypto.current_price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className={`text-sm flex items-center ${
                      crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {crypto.price_change_percentage_24h >= 0 ? (
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(crypto.id)}
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Your watchlist is empty. Add coins from the market to track them here!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
