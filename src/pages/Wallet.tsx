
import { useState, useEffect } from "react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Wallet, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

type TransactionType = "buy" | "sell";
type AmountType = "coin" | "usd";

export default function WalletPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("buy");
  const [amountType, setAmountType] = useState<AmountType>("coin");
  const [amount, setAmount] = useState("");
  const [portfolio, setPortfolio] = useState(() => {
    return JSON.parse(localStorage.getItem("portfolio") || '{"assets":[], "watchlist":[]}');
  });

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

  const handleTransaction = () => {
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

    const newPortfolio = { ...portfolio };
    
    if (transactionType === "buy") {
      newPortfolio.assets.push({
        cryptoId: selectedCrypto,
        amount: coinAmount,
        buyPrice: crypto.current_price,
        timestamp: Date.now()
      });
    } else {
      // Handle sell by adding a negative amount
      newPortfolio.assets.push({
        cryptoId: selectedCrypto,
        amount: -coinAmount,
        buyPrice: crypto.current_price,
        timestamp: Date.now()
      });
    }

    setPortfolio(newPortfolio);
    localStorage.setItem("portfolio", JSON.stringify(newPortfolio));

    toast({
      title: "Success",
      description: `Successfully ${transactionType === "buy" ? "bought" : "sold"} ${
        amountType === "coin" 
          ? `${amountNum} ${crypto.symbol.toUpperCase()}`
          : `$${amountNum} of ${crypto.symbol.toUpperCase()}`
      }`,
    });

    setAmount("");
  };

  const isValidSellAmount = () => {
    if (!selectedCrypto || !amount || transactionType !== "sell") return true;
    const holdings = calculateTotalHoldings(selectedCrypto);
    const sellAmount = amountType === "coin" 
      ? parseFloat(amount)
      : parseFloat(amount) / (cryptos?.find(c => c.id === selectedCrypto)?.current_price || 1);
    return sellAmount <= holdings;
  };

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
        <h1 className="text-4xl font-bold mb-2">Crypto Wallet</h1>
        <p className="text-muted-foreground">Buy and sell cryptocurrencies</p>
      </div>

      {selectedCrypto && (
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle>Holdings & PNL</CardTitle>
            <CardDescription>Your current position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Holdings</p>
                <p className="text-2xl font-bold">
                  {calculateTotalHoldings(selectedCrypto)} {cryptos.find(c => c.id === selectedCrypto)?.symbol.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total P/L</p>
                <p className={`text-2xl font-bold flex items-center ${
                  calculatePNL(selectedCrypto) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {calculatePNL(selectedCrypto) >= 0 ? (
                    <TrendingUp className="w-5 h-5 mr-2" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-2" />
                  )}
                  ${Math.abs(calculatePNL(selectedCrypto)).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
