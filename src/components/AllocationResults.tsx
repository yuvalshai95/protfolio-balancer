import React, { useState, useEffect } from 'react';
import { Calculator, Target, TrendingUp, Monitor } from 'lucide-react';
import { AllocationResult } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';

import { Button } from '@/components/component-library/button';
import { formatNumber } from '@/utils/formatting';

interface AllocationResultsProps {
  results: AllocationResult[];
  totalAdditionalInvestment: number;
  onFullScreenClick?: () => void;
  isFullScreen?: boolean;
}

export const AllocationResults: React.FC<AllocationResultsProps> = ({
  results,
  totalAdditionalInvestment,
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

  const totalAllocated = results.reduce(
    (sum, result) => sum + result.investmentAmount,
    0
  );
  const remainder = totalAdditionalInvestment - totalAllocated;

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
              <CardTitle>Investment Recommendations</CardTitle>
              <CardDescription>
                Optimal allocation to achieve your target percentages
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
        {/* Sticky Investment Summary */}
        <div
          className="sticky top-0 z-10 px-6 py-4 backdrop-blur-sm border-b transition-all duration-150 bg-gradient-to-r from-slate-50/95 to-gray-50/95 border-gray-200 dark:from-slate-900/30 dark:to-gray-900/30 dark:border-gray-700 shadow-sm"
          role="region"
          aria-label="Investment Summary"
          aria-live="polite">
          <div className="space-y-2">
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Additional Investment:
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ₪{formatNumber(totalAdditionalInvestment)}
              </span>
            </div>
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Total Allocated:
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ₪{formatNumber(totalAllocated)}
              </span>
            </div>
            <div className="flex items-center justify-start gap-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium w-40">
                Remaining:
              </span>
              <span
                className={`font-bold transition-colors duration-150 ${
                  remainder > 0.01
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                ₪{formatNumber(remainder)}
              </span>
            </div>
            {remainder > 0.01 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <span className="font-bold">NOTE: </span>
                    <span>
                      ₪{formatNumber(remainder)} remains unallocated. This is because no
                      single available share purchase could further improve the portfolio
                      balance.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Results List */}
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
            {results.map(result => (
              <Card key={result.symbol} className="transition-colors duration-150">
                <CardContent className={`${isFullScreen ? 'p-6' : 'p-3 sm:p-4'}`}>
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

                      {/* Investment Amount - Highlighted */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                          Recommended Investment
                        </div>
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          ₪{formatNumber(result.investmentAmount)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {result.shares} shares
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Current Value
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ₪{formatNumber(result.currentValue)}
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
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                          <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                            Target %
                          </div>
                          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {result.targetAllocation.toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                          <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                            New %
                          </div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {result.newPortfolioPercentage.toFixed(2)}%
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
                      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                              {result.symbol}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {result.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            ₪{formatNumber(result.investmentAmount)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {result.shares} shares
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3 mt-2 sm:mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              Current Value:
                            </span>
                            <div className="font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              ₪{formatNumber(result.currentValue)}
                            </div>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              Current % in Portfolio:
                            </span>
                            <div className="font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {(
                                (result.currentValue /
                                  results.reduce((sum, r) => sum + r.currentValue, 0)) *
                                100
                              ).toFixed(2)}
                              %
                            </div>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              Target %:
                            </span>
                            <div className="font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {result.targetAllocation.toFixed(2)}%
                            </div>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              New Value:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              ₪{formatNumber(result.newValue)}
                            </div>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              New % in Portfolio:
                            </span>
                            <div className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {result.newPortfolioPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div className="flex justify-between sm:block">
                            <span className="text-gray-600 dark:text-gray-400">
                              New Diff from Target:
                            </span>
                            <div
                              className={`font-medium whitespace-nowrap transition-colors duration-150 ${
                                result.newDifferenceFromTarget < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                              {result.newDifferenceFromTarget.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
