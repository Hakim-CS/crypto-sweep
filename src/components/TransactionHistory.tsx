
import { Transaction, CryptoData } from "@/lib/types";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  cryptoList: CryptoData[];
}

export default function TransactionHistory({ transactions, cryptoList }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No transactions yet</p>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const crypto = cryptoList.find(c => c.id === transaction.crypto_id);
        const formattedDate = format(new Date(transaction.timestamp), "MMM dd, yyyy HH:mm");
        const isBuy = transaction.type === 'buy';
        
        return (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isBuy ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {isBuy ? (
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isBuy ? "Bought" : "Sold"} {crypto?.symbol.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {transaction.amount.toFixed(6)} {crypto?.symbol.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                @ ${transaction.price?.toFixed(2)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
