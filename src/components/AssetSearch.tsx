import React, { useState } from 'react';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { Asset } from '../types';

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
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 445.20 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 385.67 },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 245.78 },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', price: 75.45 },
];

export const AssetSearch: React.FC<AssetSearchProps> = ({ onAddAsset, existingSymbols }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockAssets>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      setIsSearching(true);
      // Simulate API delay
      setTimeout(() => {
        const results = mockAssets.filter(
          asset => 
            asset.symbol.toLowerCase().includes(term.toLowerCase()) ||
            asset.name.toLowerCase().includes(term.toLowerCase())
        ).filter(asset => !existingSymbols.includes(asset.symbol));
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddAsset = (asset: typeof mockAssets[0]) => {
    const newAsset: Asset = {
      symbol: asset.symbol,
      name: asset.name,
      price: asset.price,
      targetAllocation: 0,
      currentValue: 0,
    };
    onAddAsset(newAsset);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add Assets</h2>
          <p className="text-sm text-gray-600">Search for stocks and ETFs to add to your portfolio</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks or ETFs (e.g., AAPL, SPY, Microsoft)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        {isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          </div>
        )}
        
        {searchResults.length > 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
            {searchResults.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-gray-900">{asset.symbol}</div>
                    <div className="text-sm text-gray-600 truncate">{asset.name}</div>
                  </div>
                  <div className="text-sm font-medium text-green-600">${asset.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => handleAddAsset(asset)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
            <p className="text-gray-600 text-center">No assets found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};