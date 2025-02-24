
import { useState } from "react";
import { useCryptoData, useHistoricalData } from "@/hooks/useCryptoData";
import { CryptoData, TimeFrame } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import CryptoList from "@/components/CryptoList";
import PriceChart from "@/components/PriceChart";
import CompareView from "@/components/CompareView";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const { toast } = useToast();
  const { data: cryptos, isLoading, error } = useCryptoData();
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoData[]>([]);
  const [selectedCryptos, setSelectedCryptos] = useState<[CryptoData | null, CryptoData | null]>([
    null,
    null,
  ]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24h");

  const { data: historicalData } = useHistoricalData(
    selectedCryptos[0]?.id || "",
    timeFrame === "24h" ? 1 : timeFrame === "7d" ? 7 : 30
  );

  const handleSearch = (results: CryptoData[]) => {
    setFilteredCryptos(results);
  };

  const handleSelectCrypto = (crypto: CryptoData) => {
    setSelectedCryptos((prev) => {
      if (!prev[0]) return [crypto, null];
      if (!prev[1]) return [prev[0], crypto];
      return prev;
    });
  };

  const handleClearComparison = () => {
    setSelectedCryptos([null, null]);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch cryptocurrency data. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading || !cryptos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div className="text-center mb-12 slide-in">
        <h1 className="text-4xl font-bold mb-2">Crypto Price Tracker</h1>
        <p className="text-muted-foreground">
          Track and compare cryptocurrency prices in real-time
        </p>
      </div>

      <SearchBar
        cryptoList={cryptos}
        onSearch={handleSearch}
      />

      {selectedCryptos[0] && (
        <PriceChart
          data={historicalData || []}
          timeFrame={timeFrame}
          onTimeFrameChange={setTimeFrame}
        />
      )}

      {selectedCryptos[0] && selectedCryptos[1] && (
        <CompareView
          crypto1={selectedCryptos[0]}
          crypto2={selectedCryptos[1]}
          onClearComparison={handleClearComparison}
        />
      )}

      <CryptoList
        cryptos={filteredCryptos.length > 0 ? filteredCryptos : cryptos}
        onSelectCrypto={handleSelectCrypto}
        selectedCryptos={selectedCryptos}
      />
    </div>
  );
}
