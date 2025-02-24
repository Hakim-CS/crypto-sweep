
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto: (crypto: CryptoData) => void;
  selectedCryptos: (CryptoData | null)[];
}

export default function CryptoList({
  cryptos,
  onSelectCrypto,
  selectedCryptos,
}: CryptoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
      {cryptos.map((crypto) => {
        const isSelected = selectedCryptos.some(
          (selected) => selected?.id === crypto.id
        );
        return (
          <CryptoCard
            key={crypto.id}
            crypto={crypto}
            onClick={() => !isSelected && onSelectCrypto(crypto)}
            className={isSelected ? "opacity-50 cursor-not-allowed" : ""}
          />
        );
      })}
    </div>
  );
}
