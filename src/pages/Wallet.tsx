import { useState, useEffect } from "react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Wallet, ArrowLeft } from "lucide-react";
import HoldingsList from "@/components/HoldingsList";
import WatchlistCard from "@/components/WatchlistCard";
import { supabase } from "@/lib/supabase";

type TransactionType = "buy" | "sell";
type AmountType = "coin" | "usd";

export default function WalletPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("buy");
  const [amountType, setAmountType] = useState<AmountType>("coin");
  const [amount, setAmount] = useState("");
  const [portfolio, setPortfolio] = useState(() => {
    const userId = user?.id || 'anonymous';
    return JSON.parse(localStorage.getItem(`portfolio_${userId}`) || '{"assets":[], "watchlist":[]}');
  });

  // Save portfolio with user ID
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`portfolio_${user.id}`, JSON.stringify(portfolio));
    }
  }, [portfolio, user?.id]);

  const calculateTotalHoldings = (cryptoId: string) => {
    return portfolio.assets.reduce((total: number, asset: any) => {
      if (asset.cryptoId === cryptoId) {
        return total + asset.amount;
      }
      return total;
    }, 0);
  };

  const calculatePNL = (cryptoId: string) => {
    const assets = portfolio.assets.filter((asset: any) => asset.cryptoId === cryptoId);
    const crypto = cryptos?.find(c => c.id === cryptoId);
    if (!crypto || assets.length === 0) return 0;

    return assets.reduce((total: number, asset: any) => {
      const currentValue = crypto.current_price * asset.amount;
      const initialValue = asset.buyPrice * asset.amount;
      return total + (currentValue - initialValue);
    }, 0);
  };

  // Update to use Supabase for portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Failed to fetch portfolio data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setPortfolio(data);
      } else {
        // Create new portfolio for user
        const newPortfolio = { assets: [], watchlist: [], user_id: user.id };
        const { error: insertError } = await supabase
          .from('portfolios')
          .insert(newPortfolio);

        if (!insertError) {
          setPortfolio(newPortfolio);
        }
      }
    };

    fetchPortfolio();
  }, [user?.id]);

  // Update transaction handler to use Supabase
  const handleTransaction = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be signed in to make transactions",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCrypto || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const crypto = cryptos?.find(c => c.id === selectedCrypto);
    if (!crypto) return;

    const amountNum = parseFloat(amount);
    const totalUSD = amountType === "coin" 
      ? amountNum * crypto.current_price
      : amountNum;
    
    const coinAmount = amountType === "coin" 
      ? amountNum 
      : amountNum / crypto.current_price;

    if (transactionType === "sell") {
      const currentHoldings = calculateTotalHoldings(selectedCrypto);
      if (coinAmount > currentHoldings) {
        toast({
          title: "Error",
          description: `Insufficient balance. You only have ${currentHoldings} ${crypto.symbol.toUpperCase()}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Create transaction record
    const transaction = {
      user_id: user.id,
      crypto_id: selectedCrypto,
      amount: transactionType === "sell" ? -coinAmount : coinAmount,
      price: crypto.current_price,
      type: transactionType,
      timestamp: new Date().toISOString()
    };

    // Insert transaction into Supabase
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction);

    if (transactionError) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
      return;
    }

    // Update portfolio in state and Supabase
    const newPortfolio = {
      ...portfolio,
      assets: [
        ...portfolio.assets,
        {
          cryptoId: selectedCrypto,
          amount: transactionType === "sell" ? -coinAmount : coinAmount,
          buyPrice: crypto.current_price,
          timestamp: Date.now()
        }
      ]
    };

    const { error: portfolioError } = await supabase
      .from('portfolios')
      .update(newPortfolio)
      .eq('user_id', user.id);

    if (!portfolioError) {
      setPortfolio(newPortfolio);
      toast({
        title: "Success",
        description: `Successfully ${transactionType === "buy" ? "bought" : "sold"} ${
          amountType === "coin" 
            ? `${amountNum} ${crypto.symbol.toUpperCase()}`
            : `$${amountNum} of ${crypto.symbol.toUpperCase()}`
        }`,
      });
      setAmount("");
    }
  };

  const isValidSellAmount = () => {
    if (!selectedCrypto || !amount || transactionType !== "sell") return true;
    const holdings = calculateTotalHoldings(selectedCrypto);
    const sellAmount = amountType === "coin" 
      ? parseFloat(amount)
      : parseFloat(amount) / (cryptos?.find(c => c.id === selectedCrypto)?.current_price || 1);
    return sellAmount <= holdings;
  };

  // Update watchlist handler to use Supabase
  const handleUpdateWatchlist = async (newWatchlist: Array<{ cryptoId: string }>) => {
    if (!user?.id) return;

    const newPortfolio = {
      ...portfolio,
      watchlist: newWatchlist
    };

    const { error } = await supabase
      .from('portfolios')
      .update(newPortfolio)
      .eq('user_id', user.id);

    if (!error) {
      setPortfolio(newPortfolio);
    }
  };

  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (isLoading || !cryptos) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Home
      </Button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">
          {isAdmin ? 'Admin Wallet Dashboard' : 'Crypto Wallet'}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'Manage all portfolios and watchlists' : 'Manage your portfolio and watchlist'}
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Admin features coming soon: User management, role assignment, and transaction history
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <HoldingsList assets={portfolio.assets} cryptos={cryptos} />
        <WatchlistCard 
          watchlist={portfolio.watchlist} 
          cryptos={cryptos}
          onUpdateWatchlist={handleUpdateWatchlist}
        />
      </div>

      <Card className={`glass ${!isValidSellAmount() ? "border-red-500" : ""}`}>
        <CardHeader>
          <CardTitle>Transaction</CardTitle>
          <CardDescription>Buy or sell cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={transactionType === "buy" ? "default" : "outline"}
              onClick={() => setTransactionType("buy")}
              className="flex-1"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Buy
            </Button>
            <Button
              variant={transactionType === "sell" ? "default" : "outline"}
              onClick={() => setTransactionType("sell")}
              className="flex-1"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Sell
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <select
                className="w-full p-2 rounded-md border mt-1"
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
              >
                <option value="">Select a cryptocurrency</option>
                {cryptos.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Amount Type</label>
              <div className="flex gap-4 mt-1">
                <Button
                  variant={amountType === "coin" ? "default" : "outline"}
                  onClick={() => setAmountType("coin")}
                  className="flex-1"
                >
                  Coin Amount
                </Button>
                <Button
                  variant={amountType === "usd" ? "default" : "outline"}
                  onClick={() => setAmountType("usd")}
                  className="flex-1"
                >
                  USD Amount
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder={amountType === "coin" ? "Enter coin amount" : "Enter USD amount"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            {selectedCrypto && amount && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Transaction Summary</p>
                <p className="text-lg font-semibold mt-1">
                  {amountType === "coin"
                    ? `$${(parseFloat(amount) * (cryptos.find(c => c.id === selectedCrypto)?.current_price || 0)).toLocaleString()}`
                    : `${(parseFloat(amount) / (cryptos.find(c => c.id === selectedCrypto)?.current_price || 1)).toLocaleString()} coins`}
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleTransaction}
              disabled={!selectedCrypto || !amount}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {transactionType === "buy" ? "Buy" : "Sell"} 
              {selectedCrypto && ` ${cryptos.find(c => c.id === selectedCrypto)?.symbol.toUpperCase()}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
