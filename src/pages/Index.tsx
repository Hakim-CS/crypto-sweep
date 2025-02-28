
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CryptoList from "@/components/CryptoList";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useState } from "react";
import { CryptoData, ChartData, TimeFrame } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import PriceChart from "@/components/PriceChart";

export default function Index() {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCryptos, setSelectedCryptos] = useState<[CryptoData | null, CryptoData | null]>([null, null]);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");
  const { toast } = useToast();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Simulate fetching chart data (in a real app, you would fetch this from an API)
  const fetchChartData = (coinId: string, tf: TimeFrame) => {
    // This is placeholder data - in a real application, you would fetch actual data
    const now = Date.now();
    const data: ChartData[] = [];
    
    const intervals = tf === "24h" ? 24 : tf === "7d" ? 7 : 30;
    const step = tf === "24h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < intervals; i++) {
      const timestamp = now - (intervals - i) * step;
      const price = 10000 + Math.random() * 2000;
      data.push({ timestamp, price });
    }
    
    setChartData(data);
  };

  // Update chart data when selected coin or timeframe changes
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    if (selectedCoin) {
      fetchChartData(selectedCoin.id, newTimeFrame);
    }
  };

  const handleSelectCrypto = (crypto: CryptoData | null) => {
    if (!crypto) {
      setSelectedCryptos([null, null]);
      setSelectedCoin(null);
      return;
    }

    // If we're not in compare mode and it's a regular click
    if (!selectedCryptos[0] && !selectedCryptos[1]) {
      setSelectedCoin(crypto);
      // Fetch chart data for the selected coin
      fetchChartData(crypto.id, timeFrame);
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
          <PriceChart 
            data={chartData}
            timeFrame={timeFrame}
            onTimeFrameChange={handleTimeFrameChange}
          />
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
