
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

  // Generate random data for portfolio and transactions
  const generateRandomData = async () => {
    if (!isSignedIn || !user || !cryptos || cryptos.length === 0) {
      toast({
        title: "Error",
        description: "You must be signed in and cryptocurrencies must be loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get random cryptocurrencies (3-5)
      const numRandomCryptos = Math.floor(Math.random() * 3) + 3; // 3-5 cryptos
      const selectedRandomCryptos = [...cryptos]
        .sort(() => 0.5 - Math.random())
        .slice(0, numRandomCryptos);
      
      // Create random assets for portfolio
      const randomAssets = selectedRandomCryptos.map(crypto => ({
        cryptoId: crypto.id,
        amount: +(Math.random() * 10).toFixed(4),
        buyPrice: crypto.current_price * (0.8 + Math.random() * 0.4), // +/- 20% of current price
        timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
      }));

      // Create random transactions
      const randomTransactions = [];
      for (const crypto of selectedRandomCryptos) {
        const numTransactions = Math.floor(Math.random() * 5) + 1; // 1-5 transactions per crypto
        
        for (let i = 0; i < numTransactions; i++) {
          const isBuy = Math.random() > 0.3; // 70% chance of buy
          const amount = +(Math.random() * 5).toFixed(4);
          const price = crypto.current_price * (0.7 + Math.random() * 0.6); // +/- 30% of current price
          const daysAgo = Math.floor(Math.random() * 30);
          
          randomTransactions.push({
            user_id: user.id,
            crypto_id: crypto.id,
            amount: isBuy ? amount : -amount,
            price: price,
            type: isBuy ? "buy" : "sell",
            timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Add some random deposits/withdrawals
      const numFundOperations = Math.floor(Math.random() * 3) + 2; // 2-4 operations
      for (let i = 0; i < numFundOperations; i++) {
        const isDeposit = Math.random() > 0.3; // 70% chance of deposit
        const amount = +(Math.random() * 1000 + 100).toFixed(2); // $100-$1100
        const daysAgo = Math.floor(Math.random() * 45);
        
        randomTransactions.push({
          user_id: user.id,
          crypto_id: null,
          amount: isDeposit ? amount : -amount,
          price: null,
          type: isDeposit ? "deposit" : "withdraw",
          timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Create random watchlist (2-4 cryptos)
      const numWatchlistItems = Math.floor(Math.random() * 3) + 2;
      const randomWatchlist = [...cryptos]
        .sort(() => 0.5 - Math.random())
        .slice(0, numWatchlistItems)
        .map(crypto => ({ cryptoId: crypto.id }));

      // Calculate total balance based on deposits/withdrawals
      const totalDeposits = randomTransactions
        .filter(t => t.type === "deposit")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalWithdrawals = randomTransactions
        .filter(t => t.type === "withdraw")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const calculatedBalance = 1000 + totalDeposits + totalWithdrawals;

      // Update portfolio
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .upsert({
          user_id: user.id,
          assets: randomAssets,
          watchlist: randomWatchlist,
          balance: calculatedBalance > 0 ? calculatedBalance : 1000
        });

      if (portfolioError) {
        console.error('Error updating portfolio:', portfolioError);
        throw portfolioError;
      }

      // Insert transactions
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(randomTransactions);

      if (transactionError) {
        console.error('Error adding transactions:', transactionError);
        throw transactionError;
      }

      // Update local watchlist state
      setWatchlist(randomWatchlist);

      toast({
        title: "Success",
        description: `Added random data: ${randomAssets.length} assets, ${randomTransactions.length} transactions, and ${randomWatchlist.length} watchlist items`,
      });
    } catch (error) {
      console.error('Error generating random data:', error);
      toast({
        title: "Error",
        description: "Failed to generate random data",
        variant: "destructive",
      });
    }
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
        <div className="flex gap-4 justify-center">
          {isSignedIn && (
            <>
              <Button 
                onClick={() => navigate('/wallet')} 
                className="mb-8"
              >
                Go to Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={generateRandomData} 
                variant="outline"
                className="mb-8"
              >
                Generate Test Data
              </Button>
            </>
          )}
        </div>
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
          {isChartLoading ? (
            <div className="flex justify-center items-center h-96">
              <p>Loading chart data...</p>
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
