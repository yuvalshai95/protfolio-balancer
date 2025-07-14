import React, { useState, useEffect, useRef } from 'react';
import { Plus, TrendingUp, Loader2, AlertCircle, Search, X } from 'lucide-react';
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
  CommandItem,
  CommandList,
} from '@/components/component-library/command';
import { Button } from '@/components/component-library/button';
import { Input } from '@/components/component-library/input';
import { Alert, AlertDescription } from '@/components/component-library/alert';
import { Badge } from '@/components/component-library/badge';
import {
  searchAssets,
  getRealtimePrice,
  getApiUsageInfo,
  EodhdSearchItem,
} from '@/services/eodhd';
import { formatPrice } from '@/utils/formatting';

interface AssetSearchProps {
  onAddAsset: (asset: Asset) => void;
  existingSymbols: string[];
}

// Mock data for development if VITE_USE_MOCK_DATA is true
const mockSearchResults: EodhdSearchItem[] = [
  {
    Code: 'ISFF702',
    Exchange: 'TA',
    Name: 'iShares Core S&P 500 UCITS ETF USD (Acc)',
    Type: 'ETF',
    Country: 'IL',
    Currency: 'ILS',
    ISIN: 'IE00B5BMR087',
    previousClose: 22120, // Will be converted to 221.20 NIS
    previousCloseDate: '2023-10-26',
  },
  {
    Code: 'OSFF701',
    Exchange: 'TA',
    Name: 'iShares S&P 500 UCITS ETF',
    Type: 'ETF',
    Country: 'IL',
    Currency: 'ILS',
    ISIN: 'IE00B5BMR087',
    previousClose: 15654, // Will be converted to 156.54 NIS
    previousCloseDate: '2023-10-26',
  },
  {
    Code: 'TEVA',
    Exchange: 'TA',
    Name: 'Teva Pharmaceutical Industries Ltd',
    Type: 'Common Stock',
    Country: 'IL',
    Currency: 'ILS',
    ISIN: 'IL0002315271',
    previousClose: 3545, // Will be converted to 35.45 NIS
    previousCloseDate: '2023-10-26',
  },
  {
    Code: 'CHKP',
    Exchange: 'TA',
    Name: 'Check Point Software Technologies Ltd',
    Type: 'Common Stock',
    Country: 'IL',
    Currency: 'ILS',
    ISIN: 'IL0010824113',
    previousClose: 18965, // Will be converted to 189.65 NIS
    previousCloseDate: '2023-10-26',
  },
  // Non-TA examples for testing
  {
    Code: 'AAPL',
    Exchange: 'US',
    Name: 'Apple Inc',
    Type: 'Common Stock',
    Country: 'US',
    Currency: 'USD',
    ISIN: 'US0378331005',
    previousClose: 189.95,
    previousCloseDate: '2023-10-26',
  },
  {
    Code: 'MSFT',
    Exchange: 'US',
    Name: 'Microsoft Corporation',
    Type: 'Common Stock',
    Country: 'US',
    Currency: 'USD',
    ISIN: 'US5949181045',
    previousClose: 338.11,
    previousCloseDate: '2023-10-26',
  },
  {
    Code: 'ASML',
    Exchange: 'AS',
    Name: 'ASML Holding NV',
    Type: 'Common Stock',
    Country: 'NL',
    Currency: 'EUR',
    ISIN: 'NL0010273215',
    previousClose: 628.4,
    previousCloseDate: '2023-10-26',
  },
];

export const AssetSearch: React.FC<AssetSearchProps> = ({
  onAddAsset,
  existingSymbols,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EodhdSearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiUsageInfo, setShowApiUsageInfo] = useState(false);

  // API usage state
  const [apiUsage, setApiUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
    isWelcomeBonus: boolean;
  }>({ used: 0, remaining: 500, total: 500, isWelcomeBonus: true });
  const [dailyUsage, setDailyUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
  } | null>(null);
  const [isApiLimitReached, setIsApiLimitReached] = useState(false);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const [isLoadingApiUsage, setIsLoadingApiUsage] = useState(false);

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch API usage data
  const fetchApiUsageData = async () => {
    setIsLoadingApiUsage(true);
    try {
      const apiInfo = await getApiUsageInfo();

      setApiUsage(apiInfo.usage);
      if (apiInfo.dailyUsage) {
        setDailyUsage(apiInfo.dailyUsage);
      }
      setIsApiLimitReached(apiInfo.limitReached);
      setIsNearLimit(apiInfo.nearLimit);
    } catch (error) {
      console.error('Failed to fetch API usage data:', error);
    } finally {
      setIsLoadingApiUsage(false);
    }
  };

  // Refresh API usage data only (without user name)
  const refreshApiUsageData = async () => {
    setIsLoadingApiUsage(true);
    try {
      const apiInfo = await getApiUsageInfo();

      setApiUsage(apiInfo.usage);
      if (apiInfo.dailyUsage) {
        setDailyUsage(apiInfo.dailyUsage);
      }
      setIsApiLimitReached(apiInfo.limitReached);
      setIsNearLimit(apiInfo.nearLimit);
    } catch (error) {
      console.error('Failed to refresh API usage data:', error);
    } finally {
      setIsLoadingApiUsage(false);
    }
  };

  // Fetch API usage on component mount (only once)
  useEffect(() => {
    if (!useMockData) {
      fetchApiUsageData();
    }
  }, [useMockData]);

  const handleSearch = async () => {
    if (searchTerm.length === 0) {
      return;
    }

    setIsOpen(true);
    setIsSearching(true);
    setApiError(null);
    setShowApiUsageInfo(false);

    try {
      let results: EodhdSearchItem[];
      if (useMockData) {
        // Simulate API delay and filter mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        const filteredResults = mockSearchResults.filter(
          asset =>
            asset.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.ISIN && asset.ISIN.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        // Apply price conversion for TA exchange (same as real API)
        const convertedResults = filteredResults.map(asset => ({
          ...asset,
          previousClose:
            asset.Exchange === 'TA' ? asset.previousClose / 100 : asset.previousClose,
        }));
        // Sort with TA exchange first, then alphabetically (same as real API)
        results = convertedResults.sort((a, b) => {
          if (a.Exchange === 'TA' && b.Exchange !== 'TA') return -1;
          if (a.Exchange !== 'TA' && b.Exchange === 'TA') return 1;
          return a.Name.localeCompare(b.Name);
        });
      } else {
        results = await searchAssets(searchTerm);
      }

      // Don't filter out existing assets - show them but mark them as existing
      setSearchResults(results);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch assets. Please try again later.';
      setApiError(errorMessage);
      console.error(error);
    } finally {
      setIsSearching(false);
      // Show API usage info after search completion (only for real API calls)
      if (!useMockData) {
        setShowApiUsageInfo(true);
        // Refresh API usage data after search (without refetching user name)
        refreshApiUsageData();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectAsset = async (asset: EodhdSearchItem) => {
    setSearchTerm('');
    setIsOpen(false);
    setShowApiUsageInfo(false); // Clear API usage info when selecting an asset

    // Optional: Show a loading state on the asset card itself
    try {
      let newAsset: Asset;
      if (useMockData) {
        newAsset = {
          symbol: asset.Code,
          name: asset.Name,
          price:
            asset.Exchange === 'TA' ? asset.previousClose / 100 : asset.previousClose,
          targetAllocation: 0,
          currentValue: 0,
          exchange: asset.Exchange,
          lastUpdated: Date.now(),
        };
      } else {
        newAsset = await getRealtimePrice(asset.Code, asset.Exchange, asset.Name);
      }
      onAddAsset(newAsset);
    } catch (error) {
      setApiError(`Could not fetch real-time price for ${asset.Code}.`);
      console.error(error);
    }
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
        {isApiLimitReached && !useMockData && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              API quota has been exceeded for today. Please try again tomorrow.
            </AlertDescription>
          </Alert>
        )}
        {isNearLimit && !isApiLimitReached && !useMockData && (
          <Alert variant="default" className="mb-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              API usage: {apiUsage.used}/{apiUsage.total} requests used{' '}
              {apiUsage.isWelcomeBonus ? 'from welcome bonus' : 'today'}.
              {apiUsage.remaining > 0
                ? ` ${apiUsage.remaining} remaining.`
                : ' Limit reached.'}
            </AlertDescription>
          </Alert>
        )}
        {showApiUsageInfo && !useMockData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm text-blue-800 flex-1">
                {isLoadingApiUsage ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating API usage...</span>
                  </div>
                ) : (
                  <>
                    <strong>API Usage:</strong>
                    <div className="mt-1 space-y-1">
                      <div>
                        Welcome bonus: {apiUsage.used}/{apiUsage.total} requests used •{' '}
                        {apiUsage.remaining} remaining
                      </div>
                      {dailyUsage && (
                        <div>
                          Daily usage: {dailyUsage.used}/{dailyUsage.total} requests used
                          • {dailyUsage.remaining} remaining
                        </div>
                      )}
                      {apiUsage.isWelcomeBonus && apiUsage.remaining <= 50 && (
                        <div className="text-orange-600">
                          Close to switching to daily limits (20/day)
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowApiUsageInfo(false)}
                className="text-blue-600 hover:text-blue-800 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="relative mb-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name, symbol, or ISIN (e.g., AAPL, iShares Core S&P 500, IE00B5BMR087)"
                disabled={isApiLimitReached && !useMockData}
                className={searchTerm.length > 0 ? 'pr-10' : ''}
              />
              {searchTerm.length > 0 && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || isApiLimitReached || searchTerm.length === 0}
              className="flex items-center gap-2">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 z-50 rounded-md border bg-popover text-popover-foreground shadow-lg">
              <Command shouldFilter={false}>
                <CommandList>
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center text-sm">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>
                        {apiError ? apiError : `No assets found matching "${searchTerm}"`}
                      </CommandEmpty>
                      <CommandGroup>
                        {searchResults.map(asset => {
                          const isExisting = existingSymbols.includes(asset.Code);
                          const isTaExchange = asset.Exchange === 'TA';
                          return (
                            <CommandItem
                              key={asset.ISIN || asset.Code}
                              value={`${asset.Code} - ${asset.Name}`}
                              onSelect={() => !isExisting && handleSelectAsset(asset)}
                              className={`flex items-center justify-between ${
                                isExisting ? 'opacity-60 cursor-not-allowed' : ''
                              }`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="font-semibold text-gray-900">
                                    {asset.Code}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {asset.Name}
                                  </div>
                                  {isTaExchange && (
                                    <Badge
                                      variant="secondary"
                                      className="!px-1.5 !py-0 !text-[10px] bg-blue-500 text-white border-0 hover:bg-blue-500">
                                      TA Exchange
                                    </Badge>
                                  )}
                                  {isExisting && (
                                    <Badge
                                      variant="outline"
                                      className="!px-1.5 !py-0 !text-[10px] bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-100">
                                      Already in portfolio
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>
                                    {formatPrice(asset.previousClose, asset.Exchange)}{' '}
                                    (Previous Close)
                                  </span>
                                  {asset.ISIN && (
                                    <>
                                      <span>•</span>
                                      <span>ISIN: {asset.ISIN}</span>
                                    </>
                                  )}
                                  {asset.Exchange && (
                                    <>
                                      <span>•</span>
                                      <span>{asset.Exchange}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                disabled={isExisting}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (!isExisting) {
                                    handleSelectAsset(asset);
                                  }
                                }}>
                                <Plus className="h-4 w-4 mr-2" />
                                {isExisting ? 'Added' : 'Add'}
                              </Button>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
