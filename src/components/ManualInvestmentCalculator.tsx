import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Target,
  Info,
  AlertTriangle,
  CheckCircle,
  Monitor,
} from 'lucide-react';
import { Asset } from '@/types';
import { formatNumber } from '@/utils/formatting';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import { Button } from '@/components/component-library/button';
import { useDebounce } from '@/hooks/useDebounce';

interface ManualShareInput {
  symbol: string;
  shares: number;
}

interface ManualInvestmentCalculatorProps {
  assets: Asset[];
  totalAdditionalInvestment: number;
  onConfirmInvestment: (shareInputs: ManualShareInput[]) => void;
  onFullScreenClick?: () => void;
  isFullScreen?: boolean;
}

/**
 * Manual Investment Calculator component
 * Allows users to manually specify share quantities with live validation and recalculation
 */
export const ManualInvestmentCalculator: React.FC<ManualInvestmentCalculatorProps> = ({
  assets,
  totalAdditionalInvestment,
  onConfirmInvestment,
  onFullScreenClick,
  isFullScreen = false,
}) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State for manual share inputs
  const [shareInputs, setShareInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    assets.forEach(asset => {
      initial[asset.symbol] = 0;
    });
    return initial;
  });

  // Debounced share inputs for live calculation
  const debouncedShareInputs = useDebounce(shareInputs, 300);

  /**
   * Calculates live results based on current share inputs
   */
  const liveResults = useMemo(() => {
    const currentPortfolioValue = assets.reduce(
      (sum, asset) => sum + asset.currentValue,
      0
    );
    const results = assets.map(asset => {
      const shares = debouncedShareInputs[asset.symbol] || 0;
      const minBuyPrice = asset.minBuyPrice || asset.price;
      const investmentAmount = shares * asset.price;
      const newValue = asset.currentValue + investmentAmount;
      const newTotalPortfolioValue = currentPortfolioValue + totalAdditionalInvestment;
      const newPortfolioPercentage =
        newTotalPortfolioValue > 0 ? (newValue / newTotalPortfolioValue) * 100 : 0;
      const currentPercentage =
        currentPortfolioValue > 0
          ? (asset.currentValue / currentPortfolioValue) * 100
          : 0;
      const newDifferenceFromTarget = newPortfolioPercentage - asset.targetAllocation;

      return {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        minBuyPrice,
        currentValue: asset.currentValue,
        targetAllocation: asset.targetAllocation,
        shares,
        investmentAmount,
        newValue,
        currentPercentage,
        newPortfolioPercentage,
        newDifferenceFromTarget,
      };
    });

    const totalSpent = results.reduce((sum, result) => sum + result.investmentAmount, 0);
    const remainingCash = totalAdditionalInvestment - totalSpent;

    return { results, totalSpent, remainingCash };
  }, [assets, debouncedShareInputs, totalAdditionalInvestment]);

  /**
   * Validation logic for share inputs
   */
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    let isValid = true;

    assets.forEach(asset => {
      const shares = shareInputs[asset.symbol] || 0;
      const minBuyPrice = asset.minBuyPrice || asset.price;

      // Check for negative values
      if (shares < 0) {
        errors[asset.symbol] = 'Cannot be negative';
        isValid = false;
      }
      // Check for proper increments
      else if (shares > 0 && (shares * asset.price) % minBuyPrice !== 0) {
        errors[asset.symbol] = `Must be in increments of ${formatNumber(
          minBuyPrice / asset.price
        )} shares`;
        isValid = false;
      }
    });

    // Check if total spending exceeds available cash
    if (liveResults.remainingCash < 0) {
      isValid = false;
    }

    return { errors, isValid, exceedsBudget: liveResults.remainingCash < 0 };
  }, [assets, shareInputs, liveResults.remainingCash]);

  /**
   * Handles share input changes with validation
   */
  const handleShareChange = (symbol: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setShareInputs(prev => ({
      ...prev,
      [symbol]: Math.max(0, numValue), // Prevent negative values
    }));
  };

  /**
   * Confirms the manual investment
   */
  const handleConfirm = () => {
    if (validation.isValid) {
      const inputs: ManualShareInput[] = Object.entries(shareInputs)
        .filter(([, shares]) => shares > 0)
        .map(([symbol, shares]) => ({ symbol, shares }));
      onConfirmInvestment(inputs);
    }
  };

  return (
    <Card
      className={`h-fit flex flex-col ${
        isFullScreen ? 'h-full max-h-none' : 'max-h-[85vh]'
      }`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calculator className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Manual Investment Calculator</CardTitle>
              <CardDescription>
                Manually specify share quantities with live portfolio calculation
              </CardDescription>
            </div>
          </div>

          {/* Full-screen button - desktop only */}
          {onFullScreenClick && !isFullScreen && (
            <Button
              onClick={onFullScreenClick}
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-2 ml-2"
              title="Open in full-screen">
              <Monitor className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Sticky Budget Summary */}
        <div
          className={`sticky top-0 z-10 px-6 py-4 backdrop-blur-sm border-b transition-all duration-150 shadow-sm ${
            validation.exceedsBudget
              ? 'bg-gradient-to-r from-red-50/95 to-rose-50/95 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:border-red-800'
              : 'bg-gradient-to-r from-slate-50/95 to-gray-50/95 border-gray-200 dark:from-slate-900/30 dark:to-gray-900/30 dark:border-gray-700'
          }`}
          role="region"
          aria-label="Budget Summary"
          aria-live="polite">
          <div className="space-y-2">
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Available Cash:
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ₪{formatNumber(totalAdditionalInvestment)}
              </span>
            </div>
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Total Allocated:
              </span>
              <span
                className={`font-bold transition-colors duration-150 ${
                  validation.exceedsBudget
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                ₪{formatNumber(liveResults.totalSpent)}
              </span>
            </div>
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Remaining:
              </span>
              <span
                className={`font-bold transition-colors duration-150 ${
                  validation.exceedsBudget
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                ₪{formatNumber(liveResults.remainingCash)}
              </span>
            </div>
            {validation.exceedsBudget && (
              <div className="flex items-center gap-2 pt-2 text-red-600 dark:text-red-400 text-xs font-medium">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Total allocation exceeds available cash</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Asset List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div
            className={`py-6 ${
              isFullScreen
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}
            style={
              isFullScreen && windowWidth >= 1800
                ? {
                    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  }
                : undefined
            }>
            {liveResults.results.map(result => {
              const hasError = validation.errors[result.symbol];
              const isOverBudget =
                validation.exceedsBudget && result.investmentAmount > 0;

              return (
                <Card
                  key={result.symbol}
                  className={`transition-colors duration-150 ${
                    hasError || isOverBudget ? 'border-red-200 dark:border-red-800' : ''
                  }`}>
                  <CardContent className={`${isFullScreen ? 'p-6' : 'p-4'}`}>
                    {isFullScreen ? (
                      /* Full Screen Card Layout */
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {result.symbol}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {result.name}
                            </p>
                          </div>
                        </div>

                        {/* Price Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                          <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Price per Share
                          </div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ₪{formatNumber(result.price)}
                          </div>
                        </div>

                        {/* Share Input */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Shares to Buy
                            </label>
                            <button
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help transition-colors duration-150"
                              title={`Minimum increment: ${formatNumber(
                                result.minBuyPrice / result.price
                              )} shares`}
                              aria-label={`Minimum increment: ${formatNumber(
                                result.minBuyPrice / result.price
                              )} shares`}>
                              <Info className="h-3 w-3" />
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step={result.minBuyPrice / result.price}
                            value={shareInputs[result.symbol] || ''}
                            onChange={e =>
                              handleShareChange(result.symbol, e.target.value)
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-150 dark:bg-gray-800 dark:text-gray-100 ${
                              hasError || isOverBudget
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-400'
                            }`}
                            placeholder="0"
                            aria-describedby={
                              hasError ? `error-${result.symbol}` : undefined
                            }
                          />
                          {hasError && (
                            <p
                              id={`error-${result.symbol}`}
                              className="text-red-600 dark:text-red-400 text-xs mt-1"
                              role="alert">
                              {hasError}
                            </p>
                          )}
                        </div>

                        {/* Investment Amount - Highlighted */}
                        {result.investmentAmount > 0 && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                            <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                              Investment Amount
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₪{formatNumber(result.investmentAmount)}
                            </div>
                          </div>
                        )}

                        {/* Results Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Current %
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {result.currentPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              New %
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {result.newPortfolioPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                              Target %
                            </div>
                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {result.targetAllocation.toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              New Value
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              ₪{formatNumber(result.newValue)}
                            </div>
                          </div>
                        </div>

                        {/* Difference Badge */}
                        <div className="text-center">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Difference from Target
                          </div>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              result.newDifferenceFromTarget < 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                            {result.newDifferenceFromTarget.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Original Compact Layout */
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {result.symbol}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {result.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Price per share
                            </div>
                            <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                              ₪{formatNumber(result.price)}
                            </div>
                          </div>
                        </div>

                        {/* Share Input */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Shares to Buy
                            </label>
                            <button
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help transition-colors duration-150"
                              title={`Minimum increment: ${formatNumber(
                                result.minBuyPrice / result.price
                              )} shares`}
                              aria-label={`Minimum increment: ${formatNumber(
                                result.minBuyPrice / result.price
                              )} shares`}>
                              <Info className="h-3 w-3" />
                            </button>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step={result.minBuyPrice / result.price}
                            value={shareInputs[result.symbol] || ''}
                            onChange={e =>
                              handleShareChange(result.symbol, e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-150 dark:bg-gray-800 dark:text-gray-100 ${
                              hasError || isOverBudget
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-400'
                            }`}
                            placeholder="0"
                            aria-describedby={
                              hasError ? `error-${result.symbol}` : undefined
                            }
                          />
                          {hasError && (
                            <p
                              id={`error-${result.symbol}`}
                              className="text-red-600 dark:text-red-400 text-xs mt-1"
                              role="alert">
                              {hasError}
                            </p>
                          )}
                        </div>

                        {/* Live Calculation Results */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Investment:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              ₪{formatNumber(result.investmentAmount)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Current %:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {result.currentPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Target %:
                            </span>
                            <div className="font-medium text-blue-600 dark:text-blue-400">
                              {result.targetAllocation.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              New %:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {result.newPortfolioPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              New Value:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              ₪{formatNumber(result.newValue)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Diff from Target:
                            </span>
                            <div
                              className={`font-medium transition-colors duration-150 ${
                                result.newDifferenceFromTarget < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                              {result.newDifferenceFromTarget.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex-shrink-0 p-6 pt-0">
          <Button
            onClick={handleConfirm}
            disabled={!validation.isValid || liveResults.totalSpent === 0}
            className="w-full transition-all duration-150"
            size="lg">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Confirm Manual Investment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
