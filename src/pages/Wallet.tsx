
import { useState } from "react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

type TransactionType = "buy" | "sell";
type AmountType = "coin" | "usd";

export default function WalletPage() {
  const { toast } = useToast();
  const { data: cryptos, isLoading } = useCryptoData();
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("buy");
  const [amountType, setAmountType] = useState<AmountType>("coin");
  const [amount, setAmount] = useState("");

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

    // Save transaction to portfolio
    const portfolio = JSON.parse(localStorage.getItem("portfolio") || '{"assets":[], "watchlist":[]}');
    
    if (transactionType === "buy") {
      portfolio.assets.push({
        cryptoId: selectedCrypto,
        amount: amountType === "coin" ? amountNum : amountNum / crypto.current_price,
        buyPrice: crypto.current_price,
        timestamp: Date.now()
      });
    } else {
      // Implement sell logic here
      // You would need to check if user has enough balance first
    }

    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    toast({
      title: "Success",
      description: `Successfully ${transactionType === "buy" ? "bought" : "sold"} ${
        amountType === "coin" 
          ? `${amountNum} ${crypto.symbol.toUpperCase()}`
          : `$${amountNum} of ${crypto.symbol.toUpperCase()}`
      }`,
    });

    // Reset form
    setAmount("");
  };

  if (isLoading || !cryptos) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Crypto Wallet</h1>
        <p className="text-muted-foreground">Buy and sell cryptocurrencies</p>
      </div>

      <Card className="glass max-w-2xl mx-auto">
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
