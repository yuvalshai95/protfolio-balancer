import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Loader2 } from 'lucide-react';
import { Asset } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/component-library/command';
import { Button } from '@/components/component-library/button';

interface AssetSearchProps {
  onAddAsset: (asset: Asset) => void;
  existingSymbols: string[];
}

// Mock data for demonstration - in production, this would come from a financial API
const mockAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 420.55 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 146.09 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 445.2 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 385.67 },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 245.78 },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', price: 75.45 },
];

export const AssetSearch: React.FC<AssetSearchProps> = ({
  onAddAsset,
  existingSymbols,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockAssets>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsOpen(true);
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        const results = mockAssets
          .filter(
            asset =>
              asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asset.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .filter(asset => !existingSymbols.includes(asset.symbol));
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, existingSymbols]);

  const handleAddAsset = (asset: (typeof mockAssets)[0]) => {
    const newAsset: Asset = {
      symbol: asset.symbol,
      name: asset.name,
      price: asset.price,
      targetAllocation: 0,
      currentValue: 0,
    };
    onAddAsset(newAsset);
    setSearchTerm('');
  };

  const handleSelectAsset = (asset: (typeof mockAssets)[0]) => {
    handleAddAsset(asset);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Add Assets</CardTitle>
            <CardDescription>
              Search for stocks and ETFs to add to your portfolio
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Command shouldFilter={false} className="overflow-visible">
          <div className="relative">
            <CommandInput
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Search stocks or ETFs (e.g., AAPL, SPY, Microsoft)"
              className="pl-10"
            />
            {isOpen && (
              <div className="absolute top-full w-full left-0 z-10 mt-2">
                <div className="rounded-md border bg-popover text-popover-foreground shadow-lg">
                  <CommandList>
                    {isSearching ? (
                      <div className="p-4 flex items-center justify-center text-sm">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          No assets found matching "{searchTerm}"
                        </CommandEmpty>
                        <CommandGroup>
                          {searchResults.map(asset => (
                            <CommandItem
                              key={asset.symbol}
                              value={asset.symbol}
                              onSelect={() => handleSelectAsset(asset)}
                              className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="font-semibold text-gray-900">
                                    {asset.symbol}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {asset.name}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-green-600">
                                  ${asset.price.toFixed(2)}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleAddAsset(asset);
                                }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </div>
              </div>
            )}
          </div>
        </Command>
      </CardContent>
    </Card>
  );
};
