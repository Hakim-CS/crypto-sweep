import { useState } from "react";
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";
import SearchBar from "./SearchBar";
import CompareView from "./CompareView";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto?: (crypto: CryptoData | null) => void;
  selectedCryptos?: [CryptoData | null, CryptoData | null];
  watchlist?: Array<{ cryptoId: string }>;
  onUpdateWatchlist?: (newWatchlist: Array<{ cryptoId: string }>) => void;
}

export default function CryptoList({ 
  cryptos, 
  onSelectCrypto,
  selectedCryptos = [null, null],
  watchlist = [],
  onUpdateWatchlist
}: CryptoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "price" | "change">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const toggleWatchlist = async (crypto: CryptoData) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add cryptocurrencies to your watchlist",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple clicks on the same crypto
    if (processingIds.includes(crypto.id)) {
      return;
    }

    try {
      setProcessingIds(prev => [...prev, crypto.id]);
      
      // Check if the crypto is already in the watchlist
      const existingIndex = watchlist.findIndex(item => item.cryptoId === crypto.id);
      let newWatchlist;
      let successMessage;

      if (existingIndex >= 0) {
        // Remove from watchlist
        newWatchlist = watchlist.filter(item => item.cryptoId !== crypto.id);
        successMessage = `${crypto.name} has been removed from your watchlist`;
      } else {
        // Add to watchlist
        newWatchlist = [...watchlist, { cryptoId: crypto.id }];
        successMessage = `${crypto.name} has been added to your watchlist`;
      }

      // First update local state for immediate UI feedback
      if (onUpdateWatchlist) {
        onUpdateWatchlist(newWatchlist);
      }

      // Then update the database
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (portfolioError) {
        throw new Error(`Error checking portfolio: ${portfolioError.message}`);
      }

      // If portfolio doesn't exist yet, create one
      if (!portfolioData) {
        const { error: insertError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            watchlist: newWatchlist,
            assets: [],
            balance: 1000
          });

        if (insertError) {
          throw new Error(`Error creating portfolio: ${insertError.message}`);
        }
      } else {
        // Update existing portfolio
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({ watchlist: newWatchlist })
          .eq('user_id', user.id);

        if (updateError) {
          throw new Error(`Error updating watchlist: ${updateError.message}`);
        }
      }

      // Show success notification
      toast({
        title: existingIndex >= 0 ? "Removed from Watchlist" : "Added to Watchlist",
        description: successMessage,
      });
    } catch (err) {
      console.error('Error in toggleWatchlist:', err);
      
      // Revert local state change on error
      if (onUpdateWatchlist) {
        onUpdateWatchlist(watchlist); // Revert to original watchlist
      }
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== crypto.id));
    }
  };

  const filteredCryptos = cryptos.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredCryptos = [...filteredCryptos]
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "rank":
          comparison = a.market_cap_rank - b.market_cap_rank;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.current_price - b.current_price;
          break;
        case "change":
          comparison = a.price_change_percentage_24h - b.price_change_percentage_24h;
          break;
      }
      
      return sortDir === "asc" ? comparison : -comparison;
    });

  const isCompareMode = selectedCryptos[0] !== null;
  const isInSelectedCryptos = (crypto: CryptoData) => 
    selectedCryptos[0]?.id === crypto.id || selectedCryptos[1]?.id === crypto.id;

  const isInWatchlist = (crypto: CryptoData) => 
    watchlist && Array.isArray(watchlist) && watchlist.some(item => item.cryptoId === crypto.id);

  const handleSort = (sortField: "rank" | "name" | "price" | "change") => {
    if (sortBy === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortField);
      setSortDir("asc");
    }
  };

  const handleClearComparison = () => {
    if (onSelectCrypto) {
      onSelectCrypto(null);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />
      
      {selectedCryptos[0] && selectedCryptos[1] && (
        <CompareView 
          crypto1={selectedCryptos[0]} 
          crypto2={selectedCryptos[1]}
          onClearComparison={handleClearComparison}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredCryptos.map(crypto => (
          <div key={crypto.id} className="relative">
            {isSignedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 hover:bg-background/50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWatchlist(crypto);
                }}
                title={isInWatchlist(crypto) ? "Remove from watchlist" : "Add to watchlist"}
                disabled={processingIds.includes(crypto.id)}
              >
                {isInWatchlist(crypto) ? (
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ) : (
                  <Star className="h-5 w-5" />
                )}
              </Button>
            )}
            <CryptoCard 
              crypto={crypto} 
              onClick={onSelectCrypto ? () => onSelectCrypto(crypto) : undefined}
              selected={isInSelectedCryptos(crypto)}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
