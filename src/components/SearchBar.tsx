
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CryptoData } from "@/lib/types";

interface SearchBarProps {
  cryptoList: CryptoData[];
  onSearch: (results: CryptoData[]) => void;
}

export default function SearchBar({ cryptoList, onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = cryptoList.filter((crypto) =>
      crypto.name.toLowerCase().includes(value.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(value.toLowerCase())
    );
    onSearch(filtered);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <Input
        type="text"
        placeholder="Search cryptocurrencies..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full glass"
      />
    </div>
  );
}
