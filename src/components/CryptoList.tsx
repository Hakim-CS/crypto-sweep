
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { CryptoData } from "@/lib/types";
import SearchBar from "./SearchBar";
import CompareView from "./CompareView";
import CryptoItem from "./CryptoItem";
import { useToast } from "@/hooks/use-toast";
import { filterCryptos, sortCryptos, type SortField, type SortDirection } from "@/utils/cryptoFilterUtils";
import { supabase } from "@/integrations/supabase/client";
import { formatClerkUserId, updateWatchlistInSupabase } from "@/utils/watchlistUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto?: (crypto: CryptoData | null) => void;
  selectedCryptos?: [CryptoData | null, CryptoData | null];
  isLoading?: boolean;
  error?: Error | null;
}

export default function CryptoList({ 
  cryptos, 
  onSelectCrypto,
  selectedCryptos = [null, null],
  isLoading = false,
  error = null,
}: CryptoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [watchlist, setWatchlist] = useState<Array<{ cryptoId: string }>>([]);
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Filter and sort the cryptos
  const filteredCryptos = filterCryptos(cryptos, searchTerm);
  const sortedAndFilteredCryptos = sortCryptos(filteredCryptos, sortBy, sortDir);

  // Check if a crypto is in selected cryptos for comparison
  const isInSelectedCryptos = (crypto: CryptoData) => 
    selectedCryptos[0]?.id === crypto.id || selectedCryptos[1]?.id === crypto.id;

  // Fetch user's watchlist from Supabase when logged in
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn || !user) {
        setWatchlist([]);
        return;
      }

      try {
        const formattedUserId = formatClerkUserId(user.id);
        const { data, error } = await supabase
          .from('portfolios')
          .select('watchlist')
          .eq('user_id', formattedUserId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching watchlist:', error);
          return;
        }

        if (data?.watchlist) {
          // Ensure the watchlist data is properly formatted as an array of { cryptoId: string }
          const formattedWatchlist = Array.isArray(data.watchlist) 
            ? data.watchlist.map((item: any) => {
                if (typeof item === 'object' && item !== null && 'cryptoId' in item) {
                  return { cryptoId: item.cryptoId };
                }
                // If we find an incorrectly formatted item, create a proper format
                return { cryptoId: typeof item === 'string' ? item : String(item) };
              })
            : [];
          
          setWatchlist(formattedWatchlist);
        } else {
          setWatchlist([]);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
      }
    };

    fetchWatchlist();
  }, [isSignedIn, user]);

  // Handle sorting
  const handleSort = (sortField: SortField) => {
    if (sortBy === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortField);
      setSortDir("asc");
    }
  };

  // Handle clearing comparison
  const handleClearComparison = () => {
    if (onSelectCrypto) {
      onSelectCrypto(null);
    }
  };

  // Handle selecting a crypto
  const handleSelectCrypto = (crypto: CryptoData) => {
    if (onSelectCrypto) {
      onSelectCrypto(crypto);
    }
  };

  // Handle toggling a crypto in the watchlist
  const handleToggleWatchlist = async (crypto: CryptoData) => {
    if (!isSignedIn || !user) {
      toast({
        title: t('loginRequired'),
        description: t('loginToManageWatchlist'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if the crypto is already in the watchlist
      const isInList = watchlist.some(item => item.cryptoId === crypto.id);
      let newWatchlist: Array<{ cryptoId: string }>;

      if (isInList) {
        // Remove from watchlist
        newWatchlist = watchlist.filter(item => item.cryptoId !== crypto.id);
        toast({
          title: t('removedFromWatchlist'),
          description: `${crypto.name} ${t('hasBeenRemoved')}`,
        });
      } else {
        // Add to watchlist
        newWatchlist = [...watchlist, { cryptoId: crypto.id }];
        toast({
          title: t('addedToWatchlist'),
          description: `${crypto.name} ${t('hasBeenAdded')}`,
        });
      }

      // Update local state
      setWatchlist(newWatchlist);

      // Update in Supabase
      await updateWatchlistInSupabase(user.id, newWatchlist);
    } catch (err) {
      console.error('Failed to update watchlist:', err);
      toast({
        title: t('error'),
        description: t('failedToUpdateWatchlist'),
        variant: "destructive"
      });
    }
  };

  // If loading, use animated skeletons!
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-32 rounded-lg bg-muted mb-4" key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-20 text-destructive animate-fade-in">
        {t('failedToFetchCryptos')}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedAndFilteredCryptos.map(crypto => (
          <CryptoItem
            key={crypto.id}
            crypto={crypto}
            onSelectCrypto={handleSelectCrypto}
            isSelected={isInSelectedCryptos(crypto)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}
