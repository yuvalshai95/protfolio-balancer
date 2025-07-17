import React from 'react';
import { Calculator, Target, TrendingUp } from 'lucide-react';
import { AllocationResult } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/component-library/card';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/component-library/alert';
import { formatNumber } from '@/utils/formatting';

interface AllocationResultsProps {
  results: AllocationResult[];
  totalAdditionalInvestment: number;
}

export const AllocationResults: React.FC<AllocationResultsProps> = ({
  results,
  totalAdditionalInvestment,
}) => {
  const totalAllocated = results.reduce(
    (sum, result) => sum + result.investmentAmount,
    0
  );
  const remainder = totalAdditionalInvestment - totalAllocated;

  return (
    <Card className="h-fit max-h-[85vh] flex flex-col">
      <CardHeader className="flex-shrink-0">
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
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 py-6">
            {results.map(result => (
              <Card key={result.symbol} className="transition-colors duration-150">
                <CardContent className="p-3 sm:p-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Summary and Alerts with spacing */}
        <div className="flex-shrink-0 p-6 pt-8 space-y-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Total Allocated:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ₪{formatNumber(totalAllocated)}
              </span>
            </div>
            {remainder > 0.01 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Remaining:
                </span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  ₪{formatNumber(remainder)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="text-gray-900 dark:text-gray-100">
                Additional Investment:
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                ₪{formatNumber(totalAdditionalInvestment)}
              </span>
            </div>
          </div>

          {remainder > 0.01 && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">Note</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                ₪{formatNumber(remainder)} remains unallocated. This is because no single
                available share purchase could further improve the portfolio balance.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
