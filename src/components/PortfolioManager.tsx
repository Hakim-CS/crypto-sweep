
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, AlertCircle, Download } from "lucide-react";
import { Portfolio, PortfolioAsset, WatchlistItem, CryptoData } from "@/lib/types";

interface PortfolioManagerProps {
  cryptoList: CryptoData[];
}

export default function PortfolioManager({ cryptoList }: PortfolioManagerProps) {
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem("portfolio");
    return saved ? JSON.parse(saved) : { assets: [], watchlist: [] };
  });

  const [newAsset, setNewAsset] = useState({
    cryptoId: "",
    amount: "",
    buyPrice: "",
  });

  const savePortfolio = (newPortfolio: Portfolio) => {
    setPortfolio(newPortfolio);
    localStorage.setItem("portfolio", JSON.stringify(newPortfolio));
  };

  const addToPortfolio = () => {
    if (!newAsset.cryptoId || !newAsset.amount || !newAsset.buyPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const asset: PortfolioAsset = {
      cryptoId: newAsset.cryptoId,
      amount: Number(newAsset.amount),
      buyPrice: Number(newAsset.buyPrice),
      timestamp: Date.now(),
    };

    savePortfolio({
      ...portfolio,
      assets: [...portfolio.assets, asset],
    });

    setNewAsset({ cryptoId: "", amount: "", buyPrice: "" });
    toast({
      title: "Success",
      description: "Asset added to portfolio",
    });
  };

  const addToWatchlist = (cryptoId: string) => {
    if (portfolio.watchlist.some(item => item.cryptoId === cryptoId)) {
      toast({
        title: "Info",
        description: "Already in watchlist",
      });
      return;
    }

    const watchlistItem: WatchlistItem = { cryptoId };
    savePortfolio({
      ...portfolio,
      watchlist: [...portfolio.watchlist, watchlistItem],
    });

    toast({
      title: "Success",
      description: "Added to watchlist",
    });
  };

  const calculatePortfolioValue = () => {
    return portfolio.assets.reduce((total, asset) => {
      const crypto = cryptoList.find(c => c.id === asset.cryptoId);
      if (!crypto) return total;
      return total + (crypto.current_price * asset.amount);
    }, 0);
  };

  const calculateTotalProfitLoss = () => {
    return portfolio.assets.reduce((total, asset) => {
      const crypto = cryptoList.find(c => c.id === asset.cryptoId);
      if (!crypto) return total;
      const currentValue = crypto.current_price * asset.amount;
      const initialValue = asset.buyPrice * asset.amount;
      return total + (currentValue - initialValue);
    }, 0);
  };

  const exportPortfolioData = () => {
    const data = {
      portfolio,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">${calculatePortfolioValue().toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total P/L</p>
              <p className={`text-2xl font-bold ${
                calculateTotalProfitLoss() >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                ${calculateTotalProfitLoss().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Asset</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="w-full p-2 rounded-md border"
                value={newAsset.cryptoId}
                onChange={(e) => setNewAsset({ ...newAsset, cryptoId: e.target.value })}
              >
                <option value="">Select Crypto</option>
                {cryptoList.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Amount"
                value={newAsset.amount}
                onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Buy Price (USD)"
                value={newAsset.buyPrice}
                onChange={(e) => setNewAsset({ ...newAsset, buyPrice: e.target.value })}
              />
            </div>
            <Button onClick={addToPortfolio}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Track your favorite cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.watchlist.map((item) => {
              const crypto = cryptoList.find(c => c.id === item.cryptoId);
              if (!crypto) return null;
              return (
                <Card key={item.cryptoId} className="bg-muted">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                      <CardTitle className="text-base">{crypto.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">${crypto.current_price.toLocaleString()}</p>
                    <p className={`text-sm ${
                      crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
