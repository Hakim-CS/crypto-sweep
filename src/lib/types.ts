
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
  volume?: number;
  rsi?: number;
  sma?: number;
  ema?: number;
}

export interface ComparisonData {
  crypto1: CryptoData | null;
  crypto2: CryptoData | null;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  interpretation: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface PortfolioAsset {
  cryptoId: string;
  amount: number;
  buyPrice: number;
  timestamp: number;
}

export interface WatchlistItem {
  cryptoId: string;
  priceAlert?: {
    above?: number;
    below?: number;
  };
}

export interface Portfolio {
  assets: PortfolioAsset[];
  watchlist: WatchlistItem[];
}

export interface ChartPreferences {
  type: 'line' | 'candlestick' | 'bar';
  showVolume: boolean;
  showIndicators: {
    rsi: boolean;
    sma: boolean;
    ema: boolean;
  };
}

export interface DashboardLayout {
  sections: {
    id: string;
    type: 'portfolio' | 'watchlist' | 'chart' | 'metrics';
    position: { x: number; y: number };
  }[];
}
