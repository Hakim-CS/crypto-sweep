
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@clerk/clerk-react";
import { isInWatchlist } from "@/utils/watchlistUtils";

interface CryptoItemProps {
  crypto: CryptoData;
  onSelectCrypto?: (crypto: CryptoData) => void;
  isSelected: boolean;
  watchlist?: Array<{ cryptoId: string }>;
  onToggleWatchlist?: (crypto: CryptoData) => void;
}

export default function CryptoItem({
  crypto,
  onSelectCrypto,
  isSelected,
  watchlist = [],
  onToggleWatchlist
}: CryptoItemProps) {
  const { t } = useLanguage();
  const { isSignedIn } = useUser();
  
  // Check if this crypto is in the watchlist
  const inWatchlist = isInWatchlist(crypto, watchlist);

  // Handle adding/removing from watchlist
  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onToggleWatchlist) {
      onToggleWatchlist(crypto);
    }
  };

  return (
    <div className="relative">
      <CryptoCard 
        crypto={crypto} 
        onClick={onSelectCrypto ? () => onSelectCrypto(crypto) : undefined}
        selected={isSelected}
        className="cursor-pointer"
      />
      {isSignedIn && onToggleWatchlist && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleToggleWatchlist}
          title={inWatchlist ? t('removeFromWatchlist') : t('addToWatchlist')}
        >
          <Star 
            className={`h-5 w-5 ${inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        </Button>
      )}
    </div>
  );
}
