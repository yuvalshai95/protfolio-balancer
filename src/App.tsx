import React, { useState, useMemo } from 'react';
import { BarChart3, Target, Calculator } from 'lucide-react';
import { AssetSearch } from './components/AssetSearch';
import { AssetCard } from './components/AssetCard';
import { PortfolioSummary } from './components/PortfolioSummary';
import { AllocationResults } from './components/AllocationResults';
import { Asset } from './types';
import { calculateOptimalAllocation, validatePortfolio } from './utils/calculations';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [additionalInvestment, setAdditionalInvestment] = useState<number>(0);

  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  };

  const handleRemoveAsset = (symbol: string) => {
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

  const existingSymbols = assets.map(asset => asset.symbol);
  const isValidPortfolio = validatePortfolio(assets);
  const hasAssets = assets.length > 0;
  const canCalculate = hasAssets && isValidPortfolio && additionalInvestment > 0;

  const allocationResults = useMemo(() => {
    if (canCalculate) {
      return calculateOptimalAllocation(assets, additionalInvestment);
    }
    return [];
  }, [assets, additionalInvestment, canCalculate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Balancer</h1>
              <p className="text-gray-600 mt-1">
                Optimize your investment allocations with precision and confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Asset Management */}
            <div className="lg:col-span-2 space-y-8">
              <AssetSearch
                onAddAsset={handleAddAsset}
                existingSymbols={existingSymbols}
              />

              {hasAssets && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assets.map(asset => (
                      <AssetCard
                        key={asset.symbol}
                        asset={asset}
                        onUpdateAllocation={handleUpdateAllocation}
                        onUpdateCurrentValue={handleUpdateCurrentValue}
                        onRemoveAsset={handleRemoveAsset}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Summary and Results */}
            <div className="space-y-8">
              {hasAssets && (
                <PortfolioSummary
                  assets={assets}
                  additionalInvestment={additionalInvestment}
                  onAdditionalInvestmentChange={setAdditionalInvestment}
                />
              )}

              {canCalculate && (
                <AllocationResults
                  results={allocationResults}
                  totalAdditionalInvestment={additionalInvestment}
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
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Portfolio Balancer - Professional investment allocation tool for optimal
            portfolio management
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
