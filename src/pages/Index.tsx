
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CryptoList from "@/components/CryptoList";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useState } from "react";
import { CryptoData } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import PriceChart from "@/components/PriceChart";

export default function Index() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCryptos, setSelectedCryptos] = useState<[CryptoData | null, CryptoData | null]>([null, null]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const { toast } = useToast();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const handleSelectCrypto = (crypto: CryptoData | null) => {
    if (!crypto) {
      setSelectedCryptos([null, null]);
      setSelectedCoin(null);
      return;
    }

    // If we're not in compare mode and it's a regular click
    if (!selectedCryptos[0] && !selectedCryptos[1]) {
      setSelectedCoin(crypto);
      return;
    }

    setSelectedCryptos(prev => {
      // If the crypto is already selected, remove it
      if (prev[0]?.id === crypto.id) {
        return [null, prev[1]];
      }
      if (prev[1]?.id === crypto.id) {
        return [prev[0], null];
      }

      // If we don't have the first selection yet
      if (!prev[0]) {
        return [crypto, prev[1]];
      }
      // If we don't have the second selection yet
      if (!prev[1]) {
        return [prev[0], crypto];
      }
      // If both slots are filled, replace the first one and shift
      return [crypto, prev[0]];
    });

    toast({
      title: "Crypto Selected",
      description: `${crypto.name} has been selected for comparison`,
    });
  };

  if (isLoading || !cryptos) {
    return <div>Loading...</div>;
  }

  const isCompareMode = selectedCryptos[0] !== null || selectedCryptos[1] !== null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {isSignedIn ? `Welcome${isAdmin ? ' Admin' : ''}, ${user?.firstName || 'back'}!` : 'Cryptocurrency Tracker'}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {isSignedIn 
            ? 'Track your portfolio and favorite cryptocurrencies'
            : 'Sign in to start managing your crypto portfolio'}
        </p>
        {isSignedIn && (
          <Button 
            onClick={() => navigate('/wallet')} 
            className="mb-8"
          >
            Go to Wallet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedCoin && !isCompareMode && (
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCoin(null)}
            className="mb-4"
          >
            Back to List
          </Button>
          <PriceChart cryptoId={selectedCoin.id} />
        </div>
      )}

      <CryptoList
        cryptos={cryptos}
        onSelectCrypto={handleSelectCrypto}
        selectedCryptos={selectedCryptos}
      />
    </div>
  );
}
