
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

export type TimeFrame = '24h' | '7d' | '30d';

export interface ChartData {
  timestamp: number;
  price: number;
}

export interface ComparisonData {
  crypto1: CryptoData | null;
  crypto2: CryptoData | null;
}
