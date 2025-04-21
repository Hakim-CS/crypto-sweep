
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CryptoList from "@/components/CryptoList";
import { useCryptoData, useHistoricalData } from "@/hooks/useCryptoData";
import { useState, useEffect } from "react";
import { CryptoData, ChartData, TimeFrame } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import PriceChart from "@/components/PriceChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isSignedIn, user } = useUser();
  const { data: cryptos, isLoading: isCryptoLoading, error: cryptoError } = useCryptoData();
  const [selectedCryptos, setSelectedCryptos] = useState<[CryptoData | null, CryptoData | null]>([null, null]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const { toast } = useToast();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
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
  const { data: historicalData, isLoading: isChartLoading, error: chartError } = useHistoricalData(
    selectedCoin?.id || "",
    timeFrameToDays(timeFrame)
  );

  // Update chart data when historical data is loaded
  useEffect(() => {
    if (historicalData) {
      setChartData(historicalData);
    }
  }, [historicalData]);

  // Error handling for cryptos and chart
  useEffect(() => {
    if (cryptoError) {
      toast({
        title: t("error"),
        description: t("failedToFetchCryptos"),
        variant: "destructive"
      });
    }
    if (chartError) {
      toast({
        title: t("error"),
        description: t("failedToFetchChart"),
        variant: "destructive"
      });
    }
  }, [cryptoError, chartError, toast, t]);

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
      title: t("cryptoSelected"),
      description: `${crypto.name} ${t('hasBeenSelectedForComparison')}`,
    });
  };

  if (isCryptoLoading) {
    // SKELETON loader (animated shimmer) for loading state
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-center items-center min-h-[60vh] animate-fade-in">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton className="h-32 rounded-lg bg-muted mb-4" key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cryptoError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] animate-fade-in">
        <span className="text-destructive">{t('failedToFetchCryptos')}</span>
      </div>
    );
  }

  const isCompareMode = selectedCryptos[0] !== null || selectedCryptos[1] !== null;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
          {isSignedIn 
            ? `${isAdmin ? t('welcomeAdmin') : t('welcomeBack')}, ${user?.firstName || ''}`
            : t('cryptoTracker')}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-8">
          {isSignedIn 
            ? t('trackPortfolio')
            : t('signInToManage')}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {isSignedIn && (
            <Button 
              onClick={() => navigate('/wallet')} 
              className="mb-4 sm:mb-8 w-full sm:w-auto hover-scale"
              size="sm"
            >
              {t('goToWallet')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    
      {selectedCoin && !isCompareMode && (
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCoin(null)}
            className="mb-4 hover-scale"
            size="sm"
          >
            {t('backToList')}
          </Button>
          {isChartLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-72 md:h-96 animate-fade-in">
              <Skeleton className="h-full w-full rounded-lg bg-muted" />
              <p className="absolute">{t('loadingChart')}</p>
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
      />
    </div>
  );
}
