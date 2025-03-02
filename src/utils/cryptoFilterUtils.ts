
import { CryptoData } from "@/lib/types";

export type SortField = "rank" | "name" | "price" | "change";
export type SortDirection = "asc" | "desc";

export const filterCryptos = (
  cryptos: CryptoData[], 
  searchTerm: string
): CryptoData[] => {
  return cryptos.filter(crypto => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const sortCryptos = (
  cryptos: CryptoData[], 
  sortBy: SortField, 
  sortDir: SortDirection
): CryptoData[] => {
  return [...cryptos].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "rank":
        comparison = a.market_cap_rank - b.market_cap_rank;
        break;
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = a.current_price - b.current_price;
        break;
      case "change":
        comparison = a.price_change_percentage_24h - b.price_change_percentage_24h;
        break;
    }
    
    return sortDir === "asc" ? comparison : -comparison;
  });
};
