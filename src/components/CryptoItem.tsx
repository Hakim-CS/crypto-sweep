
import { CryptoData } from "@/lib/types";
import CryptoCard from "./CryptoCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface CryptoItemProps {
  crypto: CryptoData;
  onSelectCrypto?: (crypto: CryptoData) => void;
  isSelected: boolean;
}

export default function CryptoItem({
  crypto,
  onSelectCrypto,
  isSelected
}: CryptoItemProps) {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <CryptoCard 
        crypto={crypto} 
        onClick={onSelectCrypto ? () => onSelectCrypto(crypto) : undefined}
        selected={isSelected}
        className="cursor-pointer"
      />
    </div>
  );
}
