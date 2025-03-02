
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoData } from "@/lib/types";
import { Star, ArrowUpIcon, ArrowDownIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface WatchlistCardProps {
  watchlist: Array<{ cryptoId: string }>;
  cryptos: CryptoData[];
  onUpdateWatchlist: (newWatchlist: Array<{ cryptoId: string }>) => void;
}

export default function WatchlistCard({ watchlist, cryptos, onUpdateWatchlist }: WatchlistCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRemoveFromWatchlist = (cryptoId: string) => {
    const newWatchlist = watchlist.filter(item => item.cryptoId !== cryptoId);
    onUpdateWatchlist(newWatchlist);
    
    const cryptoName = cryptos.find(c => c.id === cryptoId)?.name || cryptoId;
    toast({
      title: t('removedFromWatchlist'),
      description: `${cryptoName} ${t('hasBeenRemoved')}`,
    });
  };

  // Get the actual crypto objects from the watchlist IDs
  const watchlistItems = watchlist && Array.isArray(watchlist)
    ? watchlist
        .map(item => {
          const crypto = cryptos.find(c => c.id === item.cryptoId);
          return crypto ? { ...item, crypto } : null;
        })
        .filter(item => item !== null) as Array<{ cryptoId: string; crypto: CryptoData }>
    : [];

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('watchlist')}</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/")}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          {t('add')}
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
              {t('emptyWatchlist')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
