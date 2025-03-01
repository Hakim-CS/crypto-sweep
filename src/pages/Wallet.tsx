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
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  ArrowLeft, 
  PlusCircle, 
  MinusCircle, 
  DollarSign,
  BarChart4,
  CreditCard
} from "lucide-react";
import HoldingsList from "@/components/HoldingsList";
import WatchlistCard from "@/components/WatchlistCard";
import { supabase } from "@/lib/supabase";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type TransactionType = "buy" | "sell" | "deposit" | "withdraw";
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
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [portfolio, setPortfolio] = useState({
    assets: [],
    watchlist: [],
    balance: 1000
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading2, setIsLoading2] = useState(true);

  // Fetch portfolio from Supabase
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.id) {
        setIsLoading2(false);
        return;
      }

      try {
        console.log("Fetching portfolio for user:", user.id);
      
        // Check if user has a portfolio
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log("Portfolio query result:", { data, error });

        if (error) {
          console.error('Error fetching portfolio:', error);
        
          if (error.code === 'PGRST116') {
            console.log("Portfolio doesn't exist, creating a new one");
            // Portfolio doesn't exist, create a new one
            const newPortfolio = { 
              user_id: user.id, 
              assets: [], 
              watchlist: [], 
              balance: 1000 
            };
          
            const { error: insertError } = await supabase
              .from('portfolios')
              .insert(newPortfolio);

            if (insertError) {
              console.error('Error creating portfolio:', insertError);
              toast({
                title: "Error",
                description: "Failed to create portfolio",
                variant: "destructive",
              });
            } else {
              setPortfolio(newPortfolio);
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch portfolio data",
              variant: "destructive",
            });
          }
        } else if (data) {
          console.log("Portfolio fetched successfully:", data);
          // Ensure data structure is correct
          const portfolioData = {
            ...data,
            assets: Array.isArray(data.assets) ? data.assets : [],
            watchlist: Array.isArray(data.watchlist) ? data.watchlist : []
          };
          setPortfolio(portfolioData);
        }
      } catch (error) {
        console.error('Error in portfolio fetch:', error);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchPortfolio();
  }, [user?.id, toast]);

  const calculateTotalHoldings = (cryptoId: string) => {
    if (!portfolio.assets || !Array.isArray(portfolio.assets)) {
      console.log("Portfolio assets is not an array:", portfolio.assets);
      return 0;
    }
  
    const total = portfolio.assets.reduce((total: number, asset: any) => {
      if (asset.cryptoId === cryptoId) {
        return total + asset.amount;
      }
      return total;
    }, 0);
  
    console.log(`Total holdings for ${cryptoId}:`, total);
    return total;
  };

  const calculatePNL = (cryptoId: string) => {
    if (!portfolio.assets || !Array.isArray(portfolio.assets) || !cryptos) return 0;
    
    const assets = portfolio.assets.filter((asset: any) => asset.cryptoId === cryptoId);
    const crypto = cryptos?.find(c => c.id === cryptoId);
    if (!crypto || assets.length === 0) return 0;

    return assets.reduce((total: number, asset: any) => {
      const currentValue = crypto.current_price * asset.amount;
      const initialValue = asset.buyPrice * asset.amount;
      return total + (currentValue - initialValue);
    }, 0);
  };

  // Fix the handleTransaction function to properly handle buy/sell operations
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

    try {
      console.log("Starting transaction with:", { selectedCrypto, amount, transactionType, amountType });
    
      const crypto = cryptos?.find(c => c.id === selectedCrypto);
      if (!crypto) {
        toast({
          title: "Error",
          description: "Selected cryptocurrency not found",
          variant: "destructive",
        });
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }

      const totalUSD = amountType === "coin" 
        ? amountNum * crypto.current_price
        : amountNum;
    
      const coinAmount = amountType === "coin" 
        ? amountNum 
        : amountNum / crypto.current_price;

    console.log("Transaction details:", { totalUSD, coinAmount, balance: portfolio.balance });

    // Check if user has enough balance for buying
    if (transactionType === "buy" && totalUSD > portfolio.balance) {
      toast({
        title: "Error",
        description: `Insufficient balance. You only have $${portfolio.balance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough crypto for selling
    if (transactionType === "sell") {
      const currentHoldings = calculateTotalHoldings(selectedCrypto);
      console.log("Sell check - current holdings:", currentHoldings, "attempting to sell:", coinAmount);
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

    console.log("Creating transaction:", transaction);

    // Insert transaction into Supabase
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction);

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
      return;
    }

    // Update portfolio assets
    const newAsset = {
      cryptoId: selectedCrypto,
      amount: transactionType === "sell" ? -coinAmount : coinAmount,
      buyPrice: crypto.current_price,
      timestamp: Date.now()
    };

    // Update portfolio balance
    const newBalance = transactionType === "buy"
      ? portfolio.balance - totalUSD
      : portfolio.balance + totalUSD;

    // Ensure portfolio.assets is an array
    const currentAssets = Array.isArray(portfolio.assets) ? portfolio.assets : [];

    // Update portfolio in state and Supabase
    const updatedPortfolio = {
      ...portfolio,
      assets: [...currentAssets, newAsset],
      balance: newBalance
    };

    console.log("Updating portfolio:", updatedPortfolio);

    const { error: portfolioError } = await supabase
      .from('portfolios')
      .update({
        assets: updatedPortfolio.assets,
        balance: updatedPortfolio.balance
      })
      .eq('user_id', user.id);

    if (portfolioError) {
      console.error('Portfolio update error:', portfolioError);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
      return;
    }

    setPortfolio(updatedPortfolio);
    toast({
      title: "Success",
      description: `Successfully ${transactionType === "buy" ? "bought" : "sold"} ${
        amountType === "coin" 
          ? `${amountNum} ${crypto.symbol.toUpperCase()}`
          : `$${amountNum} of ${crypto.symbol.toUpperCase()}`
      }`,
    });
    setAmount("");
  } catch (error) {
    console.error('Transaction handling error:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
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

  // Update watchlist handler
  const handleUpdateWatchlist = async (newWatchlist: Array<{ cryptoId: string }>) => {
    if (!user?.id) return;

    try {
      const updatedPortfolio = {
        ...portfolio,
        watchlist: newWatchlist
      };

      const { error } = await supabase
        .from('portfolios')
        .update({ watchlist: newWatchlist })
        .eq('user_id', user.id);

      if (error) {
        console.error('Watchlist update error:', error);
        toast({
          title: "Error",
          description: "Failed to update watchlist",
          variant: "destructive",
        });
        return;
      }

      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Watchlist handling error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (isLoading || !cryptos || isLoading2) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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

      {/* Balance Card */}
      <Card className="glass mb-8">
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
          <CardDescription>Available funds for trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${portfolio.balance?.toFixed(2) || '0.00'}</div>
        </CardContent>
      </Card>

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

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart4 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trade">
            <Wallet className="w-4 h-4 mr-2" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="funds">
            <CreditCard className="w-4 h-4 mr-2" />
            Funds
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HoldingsList assets={portfolio.assets || []} cryptos={cryptos} />
            <WatchlistCard 
              watchlist={portfolio.watchlist || []} 
              cryptos={cryptos}
              onUpdateWatchlist={handleUpdateWatchlist}
            />
          </div>
        </TabsContent>
        
        {/* Trade Tab */}
        <TabsContent value="trade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Cryptocurrencies</CardTitle>
              <CardDescription>Buy and sell cryptocurrencies in your portfolio</CardDescription>
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
                    className="w-full p-2 rounded-md border mt-1 bg-background"
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
                  disabled={!selectedCrypto || !amount || !isValidSellAmount()}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {transactionType === "buy" ? "Buy" : "Sell"} 
                  {selectedCrypto && ` ${cryptos.find(c => c.id === selectedCrypto)?.symbol.toUpperCase()}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
            
        {/* Funds Tab */}
        <TabsContent value="funds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-green-500" />
                  Deposit
                </CardTitle>
                <CardDescription>Add funds to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Deposit Funds
                </Button>
              </CardContent>
            </Card>

            {/* Withdraw Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MinusCircle className="w-5 h-5 mr-2 text-red-500" />
                  Withdraw
                </CardTitle>
                <CardDescription>Withdraw funds from your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount (USD)</label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount || 
                    parseFloat(withdrawAmount) <= 0 || 
                    parseFloat(withdrawAmount) > (portfolio.balance || 0)
                  }
                >
                  <MinusCircle className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
