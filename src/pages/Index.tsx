import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp, Globe } from "lucide-react";
import CryptoList from "@/components/CryptoList";
import { useCryptoData, useHistoricalData } from "@/hooks/useCryptoData";
import { useState, useEffect } from "react";
import { CryptoData, ChartData, TimeFrame } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import PriceChart from "@/components/PriceChart";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [educationTab, setEducationTab] = useState<string>("glossary");
  
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

  // Dictionary of crypto terms for the glossary
  const glossaryTerms = [
    { term: "Blockchain", definition: "A digital ledger of transactions that is duplicated and distributed across the entire network of computer systems." },
    { term: "Cryptocurrency", definition: "A digital or virtual currency that is secured by cryptography, making it nearly impossible to counterfeit." },
    { term: "Bitcoin (BTC)", definition: "The first and most well-known cryptocurrency, created in 2009 by an unknown person using the alias Satoshi Nakamoto." },
    { term: "Ethereum (ETH)", definition: "A decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform." },
    { term: "Altcoin", definition: "Any cryptocurrency other than Bitcoin. Examples include Ethereum, Ripple, and Litecoin." },
    { term: "Mining", definition: "The process of validating transactions and adding them to the blockchain ledger, typically requiring powerful computers." },
    { term: "Wallet", definition: "A digital tool that allows users to store and manage their cryptocurrencies." },
    { term: "DeFi", definition: "Decentralized Finance - financial services using smart contracts on blockchains, operating without centralized authorities." },
    { term: "NFT", definition: "Non-Fungible Token - a unique digital asset that represents ownership of a specific item or piece of content." },
    { term: "HODL", definition: "A term derived from a misspelling of 'hold' that refers to buying and holding cryptocurrency rather than selling it." }
  ];

  // Trading strategies tutorials
  const tradingStrategies = [
    {
      title: "Dollar-Cost Averaging",
      description: "Investing a fixed amount regularly regardless of market conditions to reduce the impact of volatility.",
      steps: [
        "Decide on a fixed amount you're comfortable investing regularly",
        "Choose a schedule (weekly, bi-weekly, monthly)",
        "Stick to your schedule regardless of price fluctuations",
        "This reduces the impact of market volatility on your overall purchase price"
      ]
    },
    {
      title: "HODL Strategy",
      description: "Buying and holding cryptocurrency for the long term, ignoring short-term market fluctuations.",
      steps: [
        "Research projects you believe have long-term potential",
        "Purchase those cryptocurrencies",
        "Hold them for an extended period (years)",
        "Ignore day-to-day price fluctuations"
      ]
    },
    {
      title: "Swing Trading",
      description: "Capitalizing on 'swings' in prices by holding assets for a period of days or weeks.",
      steps: [
        "Identify cryptocurrencies with historical price volatility",
        "Study technical indicators like RSI, MACD, and moving averages",
        "Buy during downtrends when you believe the price is near bottom",
        "Sell when the asset reaches what you consider a temporary peak"
      ]
    }
  ];

  // Crypto news sources
  const newsSources = [
    {
      name: "CoinDesk",
      description: "One of the leading news sites for blockchain and cryptocurrency news.",
      url: "https://www.coindesk.com/"
    },
    {
      name: "CryptoSlate",
      description: "News aggregator covering cryptocurrency news, information and analysis.",
      url: "https://cryptoslate.com/"
    },
    {
      name: "Cointelegraph",
      description: "Leading independent digital media resource covering news on blockchain, crypto assets, and emerging fintech trends.",
      url: "https://cointelegraph.com/"
    },
    {
      name: "The Block",
      description: "Leading research, analysis and news organization covering digital assets.",
      url: "https://www.theblock.co/"
    },
    {
      name: "Decrypt",
      description: "Demystifies the decentralized web with news, guides, and explainers.",
      url: "https://decrypt.co/"
    }
  ];

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
            <Button 
              onClick={() => navigate('/wallet')} 
              className="mb-8"
            >
              Go to Wallet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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

      {/* Educational Content Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Educational Resources</CardTitle>
          <CardDescription>Learn about cryptocurrencies and trading strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="glossary" value={educationTab} onValueChange={setEducationTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="glossary">
                <BookOpen className="mr-2 h-4 w-4" />
                Crypto Glossary
              </TabsTrigger>
              <TabsTrigger value="strategies">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trading Strategies
              </TabsTrigger>
              <TabsTrigger value="news">
                <Globe className="mr-2 h-4 w-4" />
                News Sources
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="glossary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {glossaryTerms.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{item.term}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p>{item.definition}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="strategies" className="space-y-4">
              {tradingStrategies.map((strategy, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      {strategy.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-left">{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="news" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsSources.map((source, index) => (
                  <Card key={index}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="mb-4">{source.description}</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        Visit Site
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
