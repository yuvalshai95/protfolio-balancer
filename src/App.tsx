import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Calculator,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { AssetSearch } from './components/AssetSearch';
import { AssetCard } from './components/AssetCard';
import { PortfolioSummary } from './components/PortfolioSummary';
import { AllocationResults } from './components/AllocationResults';
import { ManualInvestmentCalculator } from './components/ManualInvestmentCalculator';
import { FullScreenDialog } from './components/FullScreenDialog';
import { Loader } from './components/Loader';
import { Asset } from './types';
import { calculateOptimalAllocation, validatePortfolio } from './utils/calculations';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Button } from './components/component-library/button';
import {
  savePortfolioToLocalStorage,
  loadPortfolioFromLocalStorage,
} from './utils/localStorage';
import {
  refreshAssetPrices,
  hasHitApiLimit,
  getUserName,
  getApiUsageInfo,
  refreshSingleAssetPrice,
} from './services/eodhd';
import { formatPrice } from './utils/formatting';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [additionalInvestment, setAdditionalInvestment] = useState<number>(0);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isApiLimitReached, setIsApiLimitReached] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Calculation mode and manual results
  const [isAutoCalculate, setIsAutoCalculate] = useState(true);
  const [manualAllocationResults, setManualAllocationResults] = useState<
    ReturnType<typeof calculateOptimalAllocation>
  >([]);
  const [showManualCalculator, setShowManualCalculator] = useState(false);

  // Full-screen state
  const [fullScreenPanel, setFullScreenPanel] = useState<'allocation' | 'manual' | null>(
    null
  );

  const [showRefreshApiUsage, setShowRefreshApiUsage] = useState(false);
  const [refreshApiUsage, setRefreshApiUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
    isWelcomeBonus: boolean;
  }>({ used: 0, remaining: 500, total: 500, isWelcomeBonus: true });
  const [refreshDailyUsage, setRefreshDailyUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
  } | null>(null);

  // Single asset update API usage info
  const [showSingleUpdateApiUsage, setShowSingleUpdateApiUsage] = useState(false);
  const [singleUpdateApiUsage, setSingleUpdateApiUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
    isWelcomeBonus: boolean;
  }>({ used: 0, remaining: 500, total: 500, isWelcomeBonus: true });
  const [singleUpdateDailyUsage, setSingleUpdateDailyUsage] = useState<{
    used: number;
    remaining: number;
    total: number;
  } | null>(null);

  // Updated asset info for displaying in callout
  const [updatedAssetInfo, setUpdatedAssetInfo] = useState<{
    name: string;
    symbol: string;
    oldPrice: number;
    newPrice: number;
    exchange?: string;
  } | null>(null);

  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // Fetch user name for welcome message
  useEffect(() => {
    const fetchUserData = async () => {
      if (!useMockData) {
        try {
          const [userName, limitReached] = await Promise.all([
            getUserName(),
            hasHitApiLimit(),
          ]);

          if (userName) {
            setWelcomeMessage(`Hello ${userName}`);
          }

          setIsApiLimitReached(limitReached);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Don't show welcome message if API fails, but continue with app
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        // For mock data, skip loading
        setIsInitialLoading(false);
      }
    };

    fetchUserData();
  }, [useMockData]);

  // Load portfolio from localStorage on component mount
  useEffect(() => {
    const { assets: savedAssets, additionalInvestment: savedInvestment } =
      loadPortfolioFromLocalStorage();
    if (savedAssets.length > 0) {
      setAssets(savedAssets);
    }
    if (savedInvestment > 0) {
      setAdditionalInvestment(savedInvestment);
    }
  }, []);

  // Save portfolio to localStorage whenever assets or additionalInvestment changes
  useEffect(() => {
    if (assets.length > 0 || additionalInvestment > 0) {
      savePortfolioToLocalStorage(assets, additionalInvestment);
    }
  }, [assets, additionalInvestment]);

  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const handleRemoveAsset = async (symbol: string) => {
    // Simulate API call delay for loading state demonstration
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAssets(prev => prev.filter(asset => asset.symbol !== symbol));
  };

  const handleUpdateAllocation = (symbol: string, allocation: number) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.symbol === symbol ? { ...asset, targetAllocation: allocation } : asset
      )
    );
  };

  const handleUpdateCurrentValue = (symbol: string, value: number) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.symbol === symbol ? { ...asset, currentValue: value } : asset
      )
    );
  };

  const handleRefreshSingle = async (asset: Asset) => {
    try {
      const updatedAsset = await refreshSingleAssetPrice(asset);
      // Store the current price as lastPrice before updating
      const assetWithHistory = { ...updatedAsset, lastPrice: asset.price };
      setAssets(prev =>
        prev.map(a => (a.symbol === asset.symbol ? assetWithHistory : a))
      );

      // Store updated asset info for callout display
      setUpdatedAssetInfo({
        name: asset.name,
        symbol: asset.symbol,
        oldPrice: asset.price,
        newPrice: updatedAsset.price,
        exchange: asset.exchange,
      });

      // Get updated API usage info after single refresh
      const apiInfo = await getApiUsageInfo();
      setSingleUpdateApiUsage(apiInfo.usage);
      if (apiInfo.dailyUsage) {
        setSingleUpdateDailyUsage(apiInfo.dailyUsage);
      }
      setIsApiLimitReached(apiInfo.limitReached);
      setShowSingleUpdateApiUsage(true); // Show API usage info

      // Hide bulk refresh API usage if showing
      setShowRefreshApiUsage(false);
    } catch (error) {
      console.error('Failed to refresh single asset:', error);
      throw error;
    }
  };

  const handleRefreshPrices = async () => {
    if (isApiLimitReached || assets.length === 0) {
      return;
    }

    setIsRefreshingPrices(true);
    setShowRefreshApiUsage(false); // Hide previous message
    setShowSingleUpdateApiUsage(false); // Hide single update message
    setUpdatedAssetInfo(null); // Clear single asset update info

    try {
      const refreshedAssets = await refreshAssetPrices(assets);
      // Add lastPrice from original assets to show price changes
      const assetsWithHistory = refreshedAssets.map(refreshedAsset => {
        const originalAsset = assets.find(a => a.symbol === refreshedAsset.symbol);
        return {
          ...refreshedAsset,
          lastPrice: originalAsset?.price,
        };
      });
      setAssets(assetsWithHistory);

      // Get updated API usage info after refresh
      const apiInfo = await getApiUsageInfo();
      setRefreshApiUsage(apiInfo.usage);
      if (apiInfo.dailyUsage) {
        setRefreshDailyUsage(apiInfo.dailyUsage);
      }
      setIsApiLimitReached(apiInfo.limitReached);
      setShowRefreshApiUsage(true); // Show updated API usage
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const existingSymbols = assets.map(asset => asset.symbol);
  const isValidPortfolio = validatePortfolio(assets);
  const hasAssets = assets.length > 0;
  const canCalculate = hasAssets && isValidPortfolio && additionalInvestment > 0;

  // Calculate total portfolio value for current percentage display
  const totalPortfolioValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  // Automatic allocation calculation (only when in auto mode)
  const allocationResults = useMemo(() => {
    if (canCalculate && isAutoCalculate) {
      return calculateOptimalAllocation(assets, additionalInvestment);
    }
    return [];
  }, [assets, additionalInvestment, canCalculate, isAutoCalculate]);

  // Manual calculation handler
  const handleManualCalculate = () => {
    if (canCalculate) {
      setShowManualCalculator(true);
      setManualAllocationResults([]);
    }
  };

  // Handle manual investment confirmation
  const handleConfirmManualInvestment = (
    shareInputs: Array<{ symbol: string; shares: number }>
  ) => {
    // Here you would typically update the portfolio with the manual investments
    // For now, we'll just hide the calculator and show results
    setShowManualCalculator(false);

    // Convert manual inputs back to allocation results format for display
    const results = shareInputs.map(input => {
      const asset = assets.find(a => a.symbol === input.symbol)!;
      const investmentAmount = input.shares * asset.price;
      const newValue = asset.currentValue + investmentAmount;
      const newTotalPortfolioValue = totalPortfolioValue + additionalInvestment;
      const newPortfolioPercentage = (newValue / newTotalPortfolioValue) * 100;
      const newDifferenceFromTarget = newPortfolioPercentage - asset.targetAllocation;

      return {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        currentValue: asset.currentValue,
        targetAllocation: asset.targetAllocation,
        investmentAmount,
        shares: input.shares,
        newValue,
        newPortfolioPercentage,
        newDifferenceFromTarget,
      };
    });

    setManualAllocationResults(results);
  };

  // Handle asset renaming
  const handleAssetRename = (symbol: string, newName: string) => {
    setAssets(prev =>
      prev.map(asset => (asset.symbol === symbol ? { ...asset, name: newName } : asset))
    );
  };

  // Handle auto/manual calculation mode change
  const handleAutoCalculateChange = (auto: boolean) => {
    setIsAutoCalculate(auto);
    // Clear manual results when switching to auto mode
    if (auto) {
      setManualAllocationResults([]);
      setShowManualCalculator(false);
    }
  };

  // Handle full-screen panel changes
  const handleOpenFullScreen = (panel: 'allocation' | 'manual') => {
    setFullScreenPanel(panel);
  };

  const handleCloseFullScreen = () => {
    setFullScreenPanel(null);
  };

  // Get the current results based on mode
  const currentAllocationResults = isAutoCalculate
    ? allocationResults
    : manualAllocationResults;
  const shouldShowResults = isAutoCalculate
    ? canCalculate
    : manualAllocationResults.length > 0;
  const shouldShowManualCalc = !isAutoCalculate && showManualCalculator && canCalculate;

  // Show loader while initial API call is in progress
  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          {welcomeMessage && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {welcomeMessage}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back to your portfolio management dashboard
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Asset Management */}
            <div className="lg:col-span-2 space-y-8">
              <AssetSearch
                onAddAsset={handleAddAsset}
                existingSymbols={existingSymbols}
              />

              {hasAssets && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Target className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Your Portfolio Assets
                        </h2>
                        <p className="text-sm text-gray-600">
                          Set target allocations and current values
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRefreshPrices}
                      disabled={isRefreshingPrices || isApiLimitReached}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2">
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshingPrices ? 'animate-spin' : ''}`}
                      />
                      {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
                    </Button>
                  </div>

                  {/* Bulk Refresh API Usage Info */}
                  {showRefreshApiUsage && !useMockData && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-blue-800 flex-1">
                          <strong>Price Refresh Complete!</strong>
                          <div className="mt-1 space-y-1">
                            <div>
                              Welcome bonus: {refreshApiUsage.used}/
                              {refreshApiUsage.total} requests used •{' '}
                              {refreshApiUsage.remaining} remaining
                            </div>
                            {refreshDailyUsage && (
                              <div>
                                Daily usage: {refreshDailyUsage.used}/
                                {refreshDailyUsage.total} requests used •{' '}
                                {refreshDailyUsage.remaining} remaining
                              </div>
                            )}
                            <div className="text-gray-600">
                              Updated {assets.length} asset
                              {assets.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowRefreshApiUsage(false)}
                          className="text-blue-600 hover:text-blue-800 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single Asset Update API Usage Info */}
                  {showSingleUpdateApiUsage && !useMockData && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm text-blue-800 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <strong>
                              {updatedAssetInfo
                                ? `${updatedAssetInfo.name} Updated!`
                                : 'Asset Updated!'}
                            </strong>
                            {updatedAssetInfo && (
                              <div className="flex items-center gap-1">
                                {updatedAssetInfo.newPrice > updatedAssetInfo.oldPrice ? (
                                  <>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                      +
                                      {formatPrice(
                                        updatedAssetInfo.newPrice -
                                          updatedAssetInfo.oldPrice,
                                        updatedAssetInfo.exchange
                                      )}
                                    </span>
                                  </>
                                ) : updatedAssetInfo.newPrice <
                                  updatedAssetInfo.oldPrice ? (
                                  <>
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600 font-medium">
                                      {formatPrice(
                                        updatedAssetInfo.newPrice -
                                          updatedAssetInfo.oldPrice,
                                        updatedAssetInfo.exchange
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Minus className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-600 font-medium">
                                      Price unchanged
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              Welcome bonus: {singleUpdateApiUsage.used}/
                              {singleUpdateApiUsage.total} requests used •{' '}
                              {singleUpdateApiUsage.remaining} remaining
                            </div>
                            {singleUpdateDailyUsage && (
                              <div>
                                Daily usage: {singleUpdateDailyUsage.used}/
                                {singleUpdateDailyUsage.total} requests used •{' '}
                                {singleUpdateDailyUsage.remaining} remaining
                              </div>
                            )}
                            {singleUpdateApiUsage.isWelcomeBonus &&
                              singleUpdateApiUsage.remaining <= 50 && (
                                <div className="text-orange-600">
                                  Close to switching to daily limits (20/day)
                                </div>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowSingleUpdateApiUsage(false);
                            setUpdatedAssetInfo(null);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assets.map(asset => (
                      <AssetCard
                        key={asset.symbol}
                        asset={asset}
                        totalPortfolioValue={totalPortfolioValue}
                        onUpdateAllocation={handleUpdateAllocation}
                        onUpdateCurrentValue={handleUpdateCurrentValue}
                        onRemoveAsset={handleRemoveAsset}
                        onRefreshSingle={handleRefreshSingle}
                        onAssetRename={handleAssetRename}
                        assets={assets}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary and Results */}
            <div className="space-y-8 lg:sticky lg:top-4 lg:self-start">
              {hasAssets && (
                <PortfolioSummary
                  assets={assets}
                  additionalInvestment={additionalInvestment}
                  isAutoCalculate={isAutoCalculate}
                  canCalculate={canCalculate}
                  onAdditionalInvestmentChange={setAdditionalInvestment}
                  onAutoCalculateChange={handleAutoCalculateChange}
                  onManualCalculate={handleManualCalculate}
                />
              )}

              {shouldShowResults && (
                <AllocationResults
                  results={currentAllocationResults}
                  totalAdditionalInvestment={additionalInvestment}
                  onFullScreenClick={() => handleOpenFullScreen('allocation')}
                />
              )}

              {shouldShowManualCalc && (
                <ManualInvestmentCalculator
                  assets={assets}
                  totalAdditionalInvestment={additionalInvestment}
                  onConfirmInvestment={handleConfirmManualInvestment}
                  onFullScreenClick={() => handleOpenFullScreen('manual')}
                />
              )}

              {!hasAssets && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Get Started
                  </h3>
                  <p className="text-gray-600">
                    Add assets to your portfolio to begin calculating optimal allocations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Full-Screen Modal */}
      {fullScreenPanel && hasAssets && (
        <FullScreenDialog
          open={fullScreenPanel !== null}
          onOpenChange={open => !open && handleCloseFullScreen()}
          title={
            fullScreenPanel === 'allocation'
              ? 'Investment Recommendations'
              : 'Manual Investment Calculator'
          }>
          <div className="h-full w-full max-w-none">
            {fullScreenPanel === 'allocation' && shouldShowResults && (
              <AllocationResults
                results={currentAllocationResults}
                totalAdditionalInvestment={additionalInvestment}
                onFullScreenClick={() => handleOpenFullScreen('allocation')}
                isFullScreen={true}
              />
            )}

            {fullScreenPanel === 'manual' && shouldShowManualCalc && (
              <ManualInvestmentCalculator
                assets={assets}
                totalAdditionalInvestment={additionalInvestment}
                onConfirmInvestment={handleConfirmManualInvestment}
                onFullScreenClick={() => handleOpenFullScreen('manual')}
                isFullScreen={true}
              />
            )}
          </div>
        </FullScreenDialog>
      )}
    </div>
  );
}

export default App;
