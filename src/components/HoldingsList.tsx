
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoData } from "@/lib/types";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface HoldingsListProps {
  assets: Array<{
    cryptoId: string;
    amount: number;
    buyPrice: number;
  }>;
  cryptos: CryptoData[];
}

export default function HoldingsList({ assets, cryptos }: HoldingsListProps) {
  const calculateTotalValue = (amount: number, price: number) => {
    return amount * price;
  };

  const calculatePNL = (amount: number, buyPrice: number, currentPrice: number) => {
    const initialValue = amount * buyPrice;
    const currentValue = amount * currentPrice;
    return currentValue - initialValue;
  };

  const groupedAssets = assets.reduce((acc: { [key: string]: number }, asset) => {
    if (asset.cryptoId in acc) {
      acc[asset.cryptoId] += asset.amount;
    } else {
      acc[asset.cryptoId] = asset.amount;
    }
    return acc;
  }, {});

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedAssets).map(([cryptoId, totalAmount]) => {
            const crypto = cryptos.find(c => c.id === cryptoId);
            if (!crypto || totalAmount <= 0) return null;

            const totalValue = calculateTotalValue(totalAmount, crypto.current_price);
            const pnl = calculatePNL(
              totalAmount,
              assets.find(a => a.cryptoId === cryptoId)?.buyPrice || 0,
              crypto.current_price
            );

            return (
              <div key={cryptoId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                  <div>
                    <h3 className="font-semibold">{crypto.name}</h3>
                    <p className="text-sm text-muted-foreground">{totalAmount.toFixed(6)} {crypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${totalValue.toLocaleString()}</p>
                  <p className={`text-sm flex items-center justify-end ${
                    pnl >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {pnl >= 0 ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    )}
                    ${Math.abs(pnl).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          {Object.keys(groupedAssets).length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No holdings yet. Start by buying some crypto!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
