
import { useQuery } from "@tanstack/react-query";
import { CryptoData, ChartData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useCryptoData() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["cryptos"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&locale=en"
      );
      if (!response.ok) {
        // Throw for react-query error boundary
        throw new Error("Failed to fetch cryptocurrencies");
      }
      const data = await response.json();
      return data as CryptoData[];
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrencies.",
        variant: "destructive"
      });
      console.error(error);
    }
  });
}

// Similar change for historical data
export function useHistoricalData(coinId: string, days: number) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["historicalData", coinId, days],
    queryFn: async () => {
      if (!coinId) return [];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }
      const data = await response.json();
      // Example conversion; adjust for actual ChartData format as needed
      return (data.prices || []).map(([timestamp, price]: [number, number]) => ({ timestamp, price })) as ChartData[];
    },
    enabled: !!coinId && !!days,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to fetch chart data.",
        variant: "destructive"
      });
      console.error(error);
    }
  });
}
