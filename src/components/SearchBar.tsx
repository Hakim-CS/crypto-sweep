
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { SortField, SortDirection } from "@/utils/cryptoFilterUtils";

interface SearchBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  sortBy: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
}

export default function SearchBar({ 
  searchTerm, 
  onSearch, 
  sortBy, 
  sortDir, 
  onSort 
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Input
        type="text"
        placeholder="Search cryptocurrencies..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-2">
        {["rank", "name", "price", "change"].map((field) => (
          <Button
            key={field}
            variant="outline"
            size="sm"
            onClick={() => onSort(field as SortField)}
            className={sortBy === field ? "bg-primary text-primary-foreground" : ""}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field && (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
