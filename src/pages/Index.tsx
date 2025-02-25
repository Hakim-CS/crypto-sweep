import { useState } from "react";
import { useCryptoData, useHistoricalData } from "@/hooks/useCryptoData";
import { CryptoData, TimeFrame } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import CryptoList from "@/components/CryptoList";
import PriceChart from "@/components/PriceChart";
import CompareView from "@/components/CompareView";
import PortfolioManager from "@/components/PortfolioManager";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";

export default function Index() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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
      <div className="flex justify-between mb-4">
        <Link to="/wallet">
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </Button>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="text-center mb-12 slide-in">
        <h1 className="text-4xl font-bold mb-2">Miran crypto ve arkadaslaru</h1>
        <p className="text-muted-foreground">
          Track and compare cryptocurrency prices in real-time
        </p>
      </div>

      <SearchBar
        cryptoList={cryptos}
        onSearch={handleSearch}
      />

      <PortfolioManager cryptoList={cryptos} />

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
