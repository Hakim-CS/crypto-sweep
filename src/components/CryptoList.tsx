
import { useState } from "react";
import { CryptoData } from "@/lib/types";
import SearchBar from "./SearchBar";
import CompareView from "./CompareView";
import CryptoItem from "./CryptoItem";
import { filterCryptos, sortCryptos, type SortField, type SortDirection } from "@/utils/cryptoFilterUtils";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto?: (crypto: CryptoData | null) => void;
  selectedCryptos?: [CryptoData | null, CryptoData | null];
}

export default function CryptoList({ 
  cryptos, 
  onSelectCrypto,
  selectedCryptos = [null, null]
}: CryptoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // Filter and sort the cryptos
  const filteredCryptos = filterCryptos(cryptos, searchTerm);
  const sortedAndFilteredCryptos = sortCryptos(filteredCryptos, sortBy, sortDir);

  // Check if a crypto is in selected cryptos for comparison
  const isInSelectedCryptos = (crypto: CryptoData) => 
    selectedCryptos[0]?.id === crypto.id || selectedCryptos[1]?.id === crypto.id;

  // Handle sorting
  const handleSort = (sortField: SortField) => {
    if (sortBy === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortField);
      setSortDir("asc");
    }
  };

  // Handle clearing comparison
  const handleClearComparison = () => {
    if (onSelectCrypto) {
      onSelectCrypto(null);
    }
  };

  // Handle selecting a crypto
  const handleSelectCrypto = (crypto: CryptoData) => {
    if (onSelectCrypto) {
      onSelectCrypto(crypto);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar 
        searchTerm={searchTerm} 
        onSearch={setSearchTerm}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />
      
      {selectedCryptos[0] && selectedCryptos[1] && (
        <CompareView 
          crypto1={selectedCryptos[0]} 
          crypto2={selectedCryptos[1]}
          onClearComparison={handleClearComparison}
        />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedAndFilteredCryptos.map(crypto => (
          <CryptoItem
            key={crypto.id}
            crypto={crypto}
            onSelectCrypto={handleSelectCrypto}
            isSelected={isInSelectedCryptos(crypto)}
          />
        ))}
      </div>
    </div>
  );
}
