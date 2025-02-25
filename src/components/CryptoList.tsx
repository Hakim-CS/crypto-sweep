
import CryptoCard from "./CryptoCard";
import { CryptoData } from "@/lib/types";

interface CryptoListProps {
  cryptos: CryptoData[];
  onSelectCrypto: (crypto: CryptoData) => void;
  selectedCryptos: [CryptoData | null, CryptoData | null];
}

export default function CryptoList({
  cryptos,
  onSelectCrypto,
  selectedCryptos,
}: CryptoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cryptos.map((crypto) => (
        <CryptoCard
          key={crypto.id}
          crypto={crypto}
          onClick={() => onSelectCrypto(crypto)}
          selected={selectedCryptos.some((selected) => selected?.id === crypto.id)}
        />
      ))}
    </div>
  );
}
