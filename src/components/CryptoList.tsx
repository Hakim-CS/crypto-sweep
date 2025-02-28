
import { useState, useEffect } from "react";
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
}

export default function CryptoList({ 
  cryptos, 
  onSelectCrypto,
  selectedCryptos = [null, null]
}: CryptoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "price" | "change">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const [watchlist, setWatchlist] = useState<Array<{ cryptoId: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist when component mounts and user is signed in
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // First, try to find the existing portfolio
        const { data: portfolio, error: fetchError } = await supabase
          .from('portfolios')
          .select('watchlist')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching watchlist:', fetchError);
          toast({
            title: "Error",
            description: "Failed to load your watchlist",
            variant: "destructive",
          });
        } else if (portfolio) {
          // If portfolio exists, set the watchlist
          setWatchlist(portfolio.watchlist || []);
        } else {
          // If portfolio doesn't exist, create one with empty watchlist
          const { error: insertError } = await supabase
            .from('portfolios')
            .insert({
              user_id: user.id,
              watchlist: [],
              assets: []
            });

          if (insertError) {
            console.error('Error creating portfolio:', insertError);
            toast({
              title: "Error",
              description: "Failed to create portfolio",
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.error('Error in watchlist fetch:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [isSignedIn, user, toast]);

  const toggleWatchlist = async (crypto: CryptoData) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add cryptocurrencies to your watchlist",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if the crypto is already in the watchlist
      const existingIndex = watchlist.findIndex(item => item.cryptoId === crypto.id);
      let newWatchlist;

      if (existingIndex >= 0) {
        // Remove from watchlist
        newWatchlist = watchlist.filter(item => item.cryptoId !== crypto.id);
        toast({
          title: "Removed from Watchlist",
          description: `${crypto.name} has been removed from your watchlist`,
        });
      } else {
        // Add to watchlist
        newWatchlist = [...watchlist, { cryptoId: crypto.id }];
        toast({
          title: "Added to Watchlist",
          description: `${crypto.name} has been added to your watchlist`,
        });
      }

      // Update watchlist in database
      const { error } = await supabase
        .from('portfolios')
        .update({ watchlist: newWatchlist })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating watchlist:', error);
        toast({
          title: "Error",
          description: "Failed to update watchlist",
          variant: "destructive",
        });
        return;
      }

      // If database update successful, update local state
      setWatchlist(newWatchlist);
    } catch (err) {
      console.error('Error in toggleWatchlist:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
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
    watchlist.some(item => item.cryptoId === crypto.id);

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
      onSelectCrypto(null as any);
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
