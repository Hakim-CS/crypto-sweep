
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, AlertCircle, Download, Trash2 } from "lucide-react";
import { 
  Portfolio, 
  PortfolioAsset, 
  WatchlistItem, 
  CryptoData, 
  Transaction 
} from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { formatClerkUserId } from "@/utils/watchlistUtils";
import { format } from "date-fns";
import TransactionHistory from "./TransactionHistory";
import PortfolioChart from "./PortfolioChart";

interface PortfolioManagerProps {
  cryptoList: CryptoData[];
}

const addAssetSchema = z.object({
  cryptoId: z.string().min(1, "Please select a cryptocurrency"),
  amount: z.string().min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  buyPrice: z.string().min(1, "Buy price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Buy price must be a positive number",
    }),
});

export default function PortfolioManager({ cryptoList }: PortfolioManagerProps) {
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    assets: [],
    watchlist: []
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof addAssetSchema>>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: {
      cryptoId: "",
      amount: "",
      buyPrice: "",
    },
  });

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!isSignedIn || !user) return;
      
      setIsLoading(true);
      try {
        const formattedUserId = formatClerkUserId(user.id);
        
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('assets, watchlist')
          .eq('user_id', formattedUserId)
          .maybeSingle();
          
        if (portfolioError) throw portfolioError;
        
        if (portfolioData) {
          const assets = Array.isArray(portfolioData.assets) 
            ? (portfolioData.assets as unknown) as PortfolioAsset[]
            : [];
            
          const watchlist = Array.isArray(portfolioData.watchlist)
            ? (portfolioData.watchlist as unknown) as WatchlistItem[]
            : [];
            
          setPortfolio({
            assets,
            watchlist
          });
        }
        
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', formattedUserId)
          .order('timestamp', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, [isSignedIn, user, toast]);

  const savePortfolio = async (newPortfolio: Portfolio) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Error",
        description: "Please sign in to save portfolio",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const formattedUserId = formatClerkUserId(user.id);
      
      const { error } = await supabase
        .from('portfolios')
        .upsert([{ 
          user_id: formattedUserId, 
          assets: newPortfolio.assets,
          watchlist: newPortfolio.watchlist
        }], { onConflict: 'user_id' });
        
      if (error) throw error;
      
      setPortfolio(newPortfolio);
      
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to save portfolio",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof addAssetSchema>) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Error",
        description: "Please sign in to add assets",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const formattedUserId = formatClerkUserId(user.id);
      const amount = Number(values.amount);
      const buyPrice = Number(values.buyPrice);
      const timestamp = Date.now();
      
      const asset: PortfolioAsset = {
        cryptoId: values.cryptoId,
        amount,
        buyPrice,
        timestamp,
      };

      const newPortfolio = {
        ...portfolio,
        assets: [...portfolio.assets, asset],
      };
      
      await savePortfolio(newPortfolio);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: formattedUserId,
          crypto_id: values.cryptoId,
          amount,
          price: buyPrice,
          type: 'buy',
        });
        
      if (error) throw error;
      
      const crypto = cryptoList.find(c => c.id === values.cryptoId);
      setTransactions(prev => [{
        id: Date.now(),
        user_id: formattedUserId,
        crypto_id: values.cryptoId,
        amount,
        price: buyPrice,
        timestamp: new Date().toISOString(),
        type: 'buy'
      }, ...prev]);
      
      form.reset();
      
      toast({
        title: "Success",
        description: `Added ${amount} ${crypto?.symbol.toUpperCase() || ''} to portfolio`,
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset",
        variant: "destructive",
      });
    }
  };

  const removeAsset = async (index: number) => {
    if (!isSignedIn || !user) return;
    
    try {
      const asset = portfolio.assets[index];
      const newAssets = [...portfolio.assets];
      newAssets.splice(index, 1);
      
      const newPortfolio = {
        ...portfolio,
        assets: newAssets
      };
      
      await savePortfolio(newPortfolio);
      
      const formattedUserId = formatClerkUserId(user.id);
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: formattedUserId,
          crypto_id: asset.cryptoId,
          amount: asset.amount,
          price: cryptoList.find(c => c.id === asset.cryptoId)?.current_price || 0,
          type: 'sell',
        });
        
      if (error) throw error;
      
      const crypto = cryptoList.find(c => c.id === asset.cryptoId);
      setTransactions(prev => [{
        id: Date.now(),
        user_id: formattedUserId,
        crypto_id: asset.cryptoId,
        amount: asset.amount,
        price: crypto?.current_price || 0,
        timestamp: new Date().toISOString(),
        type: 'sell'
      }, ...prev]);
      
      toast({
        title: "Asset Removed",
        description: `Removed ${asset.amount} ${crypto?.symbol.toUpperCase() || ''} from portfolio`,
      });
    } catch (error) {
      console.error('Error removing asset:', error);
      toast({
        title: "Error",
        description: "Failed to remove asset",
        variant: "destructive",
      });
    }
  };

  const calculatePortfolioValue = () => {
    return portfolio.assets.reduce((total, asset) => {
      const crypto = cryptoList.find(c => c.id === asset.cryptoId);
      if (!crypto) return total;
      return total + (crypto.current_price * asset.amount);
    }, 0);
  };

  const calculateTotalInvestment = () => {
    return portfolio.assets.reduce((total, asset) => {
      return total + (asset.buyPrice * asset.amount);
    }, 0);
  };

  const calculateTotalProfitLoss = () => {
    const currentValue = calculatePortfolioValue();
    const investment = calculateTotalInvestment();
    return currentValue - investment;
  };

  const getProfitLossPercentage = () => {
    const investment = calculateTotalInvestment();
    if (investment === 0) return 0;
    
    const profitLoss = calculateTotalProfitLoss();
    return (profitLoss / investment) * 100;
  };

  const exportPortfolioData = () => {
    const data = {
      portfolio,
      transactions,
      exportDate: new Date().toISOString(),
      totalValue: calculatePortfolioValue(),
      profitLoss: calculateTotalProfitLoss(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isSignedIn) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Portfolio Manager</CardTitle>
          <CardDescription>Sign in to track your crypto portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="text-center space-y-2">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Authentication Required</h3>
            <p className="text-muted-foreground">Please sign in to access your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Track your crypto investments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportPortfolioData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">${calculatePortfolioValue().toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Investment</p>
              <p className="text-2xl font-bold">${calculateTotalInvestment().toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total P/L</p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${
                  calculateTotalProfitLoss() >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  ${Math.abs(calculateTotalProfitLoss()).toLocaleString()}
                  {calculateTotalProfitLoss() >= 0 ? " +" : " -"}
                </p>
                <p className={`ml-2 ${
                  getProfitLossPercentage() >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  ({Math.abs(getProfitLossPercentage()).toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          {portfolio.assets.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
              <div className="space-y-4">
                {portfolio.assets.map((asset, index) => {
                  const crypto = cryptoList.find(c => c.id === asset.cryptoId);
                  if (!crypto) return null;
                  
                  const currentValue = crypto.current_price * asset.amount;
                  const investedValue = asset.buyPrice * asset.amount;
                  const profitLoss = currentValue - investedValue;
                  const profitLossPercentage = (profitLoss / investedValue) * 100;
                  
                  return (
                    <div key={`${asset.cryptoId}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                        <div>
                          <h4 className="font-semibold">{crypto.name}</h4>
                          <div className="flex space-x-2 text-sm text-muted-foreground">
                            <span>{asset.amount.toFixed(6)} {crypto.symbol.toUpperCase()}</span>
                            <span>|</span>
                            <span>Bought @ ${asset.buyPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${currentValue.toLocaleString()}</p>
                        <p className={`text-sm flex items-center justify-end ${
                          profitLoss >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {profitLoss >= 0 ? "+" : "-"}${Math.abs(profitLoss).toLocaleString()} ({Math.abs(profitLossPercentage).toFixed(2)}%)
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeAsset(index)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {portfolio.assets.length > 1 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>
              <div className="h-64">
                <PortfolioChart assets={portfolio.assets} cryptoList={cryptoList} />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Asset</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cryptoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cryptocurrency</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 rounded-md border"
                            {...field}
                          >
                            <option value="">Select Crypto</option>
                            {cryptoList.map((crypto) => (
                              <option key={crypto.id} value={crypto.id}>
                                {crypto.name} ({crypto.symbol.toUpperCase()})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="buyPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buy Price (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Portfolio
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Record of your crypto transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={transactions} cryptoList={cryptoList} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
