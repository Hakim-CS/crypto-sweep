
import { useState } from "react";
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";
import { Star, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isInWatchlist, updateWatchlistInSupabase } from "@/utils/watchlistUtils";

interface CryptoItemProps {
  crypto: CryptoData;
  watchlist: Array<{ cryptoId: string }>;
  onUpdateWatchlist?: (newWatchlist: Array<{ cryptoId: string }>) => void;
  onSelectCrypto?: (crypto: CryptoData) => void;
  isSelected: boolean;
}

export default function CryptoItem({
  crypto,
  watchlist,
  onUpdateWatchlist,
  onSelectCrypto,
  isSelected
}: CryptoItemProps) {
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn || !user) {
      toast({
        title: t('authRequired'),
        description: t('signInForWatchlist'),
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple clicks
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check if the crypto is already in the watchlist
      const isWatchlisted = isInWatchlist(crypto, watchlist);
      
      let newWatchlist;
      
      if (isWatchlisted) {
        // Remove from watchlist
        newWatchlist = watchlist.filter(item => item.cryptoId !== crypto.id);
      } else {
        // Add to watchlist
        newWatchlist = [...watchlist, { cryptoId: crypto.id }];
      }

      // Update local state first for immediate UI feedback
      if (onUpdateWatchlist) {
        onUpdateWatchlist(newWatchlist);
      }

      // Update in Supabase
      await updateWatchlistInSupabase(user.id, newWatchlist);

      // Show success notification
      toast({
        title: isWatchlisted ? t('removedFromWatchlist') : t('addedToWatchlist'),
        description: isWatchlisted 
          ? `${crypto.name} ${t('hasBeenRemoved')}` 
          : `${crypto.name} ${t('hasBeenAdded')}`,
      });
    } catch (err) {
      console.error('Error in toggleWatchlist:', err);
      
      // Revert local state change on error
      if (onUpdateWatchlist) {
        onUpdateWatchlist(watchlist);
      }
      
      toast({
        title: t('error'),
        description: err instanceof Error ? err.message : t('unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {isSignedIn && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 hover:bg-background/50"
          onClick={handleToggleWatchlist}
          title={isInWatchlist(crypto, watchlist) ? t('removeFromWatchlist') : t('addToWatchlist')}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : isInWatchlist(crypto, watchlist) ? (
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="h-5 w-5" />
          )}
        </Button>
      )}
      <CryptoCard 
        crypto={crypto} 
        onClick={onSelectCrypto ? () => onSelectCrypto(crypto) : undefined}
        selected={isSelected}
        className="cursor-pointer"
      />
    </div>
  );
}
