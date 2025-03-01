
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CryptoList from "@/components/CryptoList";
import { useCryptoData, useHistoricalData } from "@/hooks/useCryptoData";
import { useState, useEffect } from "react";
import { CryptoData, ChartData, TimeFrame } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import PriceChart from "@/components/PriceChart";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isSignedIn, user } = useUser();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCryptos, setSelectedCryptos] = useState<[CryptoData | null, CryptoData | null]>([null, null]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const { toast } = useToast();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [watchlist, setWatchlist] = useState<Array<{ cryptoId: string }>>([]);
  
  // Convert timeFrame to days for API request
  const timeFrameToDays = (tf: TimeFrame): number => {
    switch(tf) {
      case "24h": return 1;
      case "7d": return 7;
      case "30d": return 30;
      default: return 1;
    }
  };

  // Use the historical data hook when we have a selected coin
  const { data: historicalData, isLoading: isChartLoading } = useHistoricalData(
    selectedCoin?.id || "",
    timeFrameToDays(timeFrame)
  );

  // Fetch user's watchlist when signed in
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn || !user) return;

      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('watchlist')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching watchlist:', error);
        } else if (data) {
          setWatchlist(data.watchlist || []);
        }
      } catch (err) {
        console.error('Error in watchlist fetch:', err);
      }
    };

    fetchWatchlist();
  }, [isSignedIn, user]);

  // Update chart data when historical data is loaded
  useEffect(() => {
    if (historicalData) {
      setChartData(historicalData);
    }
  }, [historicalData]);

  // Update chart data when selected coin or timeframe changes
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  const handleSelectCrypto = (crypto: CryptoData | null) => {
    if (!crypto) {
      setSelectedCryptos([null, null]);
      setSelectedCoin(null);
      return;
    }

    // If we're not in compare mode and it's a regular click
    if (selectedCryptos[0] === null && selectedCryptos[1] === null) {
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
          {isSignedIn 
            ? `${isAdmin ? t('welcomeAdmin') : t('welcomeBack')}, ${user?.firstName || ''}`
            : t('cryptoTracker')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {isSignedIn 
            ? t('trackPortfolio')
            : t('signInToManage')}
        </p>
        <div className="flex gap-4 justify-center">
          {isSignedIn && (
            <Button 
              onClick={() => navigate('/wallet')} 
              className="mb-8"
            >
              {t('goToWallet')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {/*
          <Button 
            onClick={() => navigate('/education')} 
            className="mb-8"
            variant="outline"
          >
            {t('education')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      */}

      {selectedCoin && !isCompareMode && (
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCoin(null)}
            className="mb-4"
          >
            {t('backToList')}
          </Button>
          {isChartLoading ? (
            <div className="flex justify-center items-center h-96">
              <p>{t('loadingChart')}</p>
            </div>
          ) : (
            <PriceChart 
              data={chartData}
              timeFrame={timeFrame}
              onTimeFrameChange={handleTimeFrameChange}
            />
          )}
        </div>
      )}

      <CryptoList
        cryptos={cryptos}
        onSelectCrypto={handleSelectCrypto}
        selectedCryptos={selectedCryptos}
        watchlist={watchlist}
        onUpdateWatchlist={setWatchlist}
      />
    </div>
  );
}
