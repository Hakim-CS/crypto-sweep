
import { useQuery } from "@tanstack/react-query";
import { CryptoData, ChartData } from "@/lib/types";

const API_BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchCryptoData(): Promise<CryptoData[]> {
  const response = await fetch(
    `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&locale=en`
  );
  if (!response.ok) throw new Error('Failed to fetch crypto data');
  return response.json();
}

async function fetchHistoricalData(id: string, days: number): Promise<ChartData[]> {
  const response = await fetch(
    `${API_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!response.ok) throw new Error('Failed to fetch historical data');
  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number], index: number) => ({
    timestamp,
    price,
    volume: data.total_volumes?.[index]?.[1],
  }));
}

export function useCryptoData() {
  return useQuery({
    queryKey: ['cryptoData'],
    queryFn: fetchCryptoData,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useHistoricalData(id: string, days: number) {
  return useQuery({
    queryKey: ['historicalData', id, days],
    queryFn: () => fetchHistoricalData(id, days),
    enabled: !!id,
  });
}
